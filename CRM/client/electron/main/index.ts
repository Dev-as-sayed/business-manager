import { app, BrowserWindow, ipcMain, protocol, shell, type IpcMainInvokeEvent } from 'electron';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative } from 'node:path';
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './auth-storage';

const APP_URL = 'app://./index.html';
const RENDERER_ROOT = join(__dirname, '../renderer');
const RENDERER_URL = process.env.ELECTRON_RENDERER_URL;

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

app.setName('Manifest CRM');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.manifest.crm');
}

const assertTrustedSender = (event: IpcMainInvokeEvent): void => {
  if (!mainWindow || BrowserWindow.fromWebContents(event.sender) !== mainWindow) {
    throw new Error('Untrusted IPC sender');
  }
};

const registerAuthIpc = (): void => {
  ipcMain.handle('desktop:auth:get-refresh-token', async (event) => {
    assertTrustedSender(event);
    return readRefreshToken();
  });

  ipcMain.handle('desktop:auth:set-refresh-token', async (event, token: unknown) => {
    assertTrustedSender(event);

    if (typeof token !== 'string' || token.length === 0 || token.length > 8192) {
      throw new Error('Invalid refresh token');
    }

    await writeRefreshToken(token);
  });

  ipcMain.handle('desktop:auth:clear-refresh-token', async (event) => {
    assertTrustedSender(event);
    await clearRefreshToken();
  });
};

const registerAppProtocol = (): void => {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === '/' || extname(pathname) === '') {
      pathname = '/index.html';
    }

    const filePath = normalize(join(RENDERER_ROOT, pathname));
    const relativePath = relative(RENDERER_ROOT, filePath);

    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const content = await readFile(filePath);
      const contentType = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

      return new Response(new Uint8Array(content), {
        headers: { 'content-type': contentType },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
};

const isInternalUrl = (url: string): boolean =>
  RENDERER_URL ? url.startsWith(RENDERER_URL) : url.startsWith('app://');

const openExternalUrl = (url: string): void => {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    void shell.openExternal(url);
  }
};

const createWindow = async (): Promise<void> => {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0c1b1e',
    title: 'Manifest CRM',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow = window;

  window.once('ready-to-show', () => {
    window.show();
  });

  window.on('closed', () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!isInternalUrl(url)) {
      event.preventDefault();
      openExternalUrl(url);
    }
  });

  window.webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });

  if (RENDERER_URL) {
    await window.loadURL(RENDERER_URL);
  } else {
    await window.loadURL(APP_URL);
  }
};

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  });

  app
    .whenReady()
    .then(async () => {
      registerAppProtocol();
      registerAuthIpc();
      await createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          void createWindow();
        }
      });
    })
    .catch((error: unknown) => {
      console.error(error);
      app.quit();
    });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
