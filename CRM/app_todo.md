# Client TODO: React + TypeScript + RTK Query

## Phase 0: Project setup

- [x] Create the app with Vite (React + TS), `strict: true`, path aliases (`@/app`, `@/features`, `@/shared`)
- [x] Install: `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` (toasts), `date-fns`, `async-mutex`
- [x] Tailwind CSS + shadcn/ui, `lucide-react` icons
- [x] ESLint, Prettier, Vitest + Testing Library, MSW (mock API for tests)
- [x] `.env` / `.env.example` with `VITE_API_URL`, validated with Zod at startup
- [x] Build it as a plain web app first. Electron wraps it later, with no Electron-specific code in features.

## Phase 1: Folder structure

```
src/
├── app/
│   ├── store.ts            # configureStore
│   ├── hooks.ts            # typed useAppDispatch / useAppSelector
│   ├── router.tsx          # route tree
│   └── providers.tsx
├── api/
│   ├── baseApi.ts          # createApi + baseQueryWithReauth
│   └── types.ts            # ApiResponse<T>, ApiError, Meta
├── features/
│   └── <module>/
│       ├── <module>.api.ts       # injectEndpoints
│       ├── <module>.types.ts
│       ├── <module>.schema.ts    # Zod forms
│       ├── components/
│       └── pages/
├── shared/
│   ├── components/         # DataTable, PageHeader, StatusBadge, EmptyState, ErrorState
│   ├── guards/             # ProtectedRoute, RoleGuard, Can
│   ├── hooks/              # usePermission, useDebounce, useTableParams
│   └── utils/
├── layouts/                # AuthLayout, DashboardLayout (sidebar, topbar)
└── main.tsx
```

**Rule:** pages compose components, components call RTK Query hooks, and only `*.api.ts` files know about URLs.

## Phase 2: RTK Query core (build before any feature)

- [x] Shared types matching the server shape:
  ```ts
  ApiResponse<T> = { success: boolean; message: string; data: T; meta?: Meta }
  ApiError = { success: false; message: string; errors?: { field: string; message: string }[] }
  ```
- [x] **`baseApi`** with `fetchBaseQuery({ baseUrl, credentials: 'include' })`
- [x] **`baseQueryWithReauth`**: on `401`, call `/auth/refresh` once, retry the original request, and on failure dispatch `logout` and redirect to login
- [x] Use a **mutex** (`async-mutex`) so parallel 401s trigger only one refresh
- [x] `transformResponse` to unwrap `data` and keep `meta` for lists
- [x] `transformErrorResponse` to normalize every error into one `ApiError` shape
- [x] Define **tag types** (`Customer`, `Quotation`, `Shipment`, ...) for cache invalidation
- [x] Use `injectEndpoints` per feature so there is one `baseApi` and many small files
- [x] Global handler for `403` (toast, "no permission") and `429` (rate limit message)

## Phase 3: Auth and tokens in cookies

Decision: **the server sets the cookies, the client never touches tokens.**

- [x] Server: refresh token in an `httpOnly`, `Secure`, `SameSite` cookie; access token in an httpOnly cookie too (or returned in the body and kept in memory only)
- [x] Client: never store tokens in `localStorage` or Redux. JS cannot read httpOnly cookies, which is the point.
- [x] Client: `credentials: 'include'` on every request
- [x] Server: CORS with `credentials: true` and an explicit origin (no `*`)
- [x] Endpoints: `login`, `logout`, `refresh`, `getMe` (`/auth/me`)
- [x] **Auth bootstrap on app load:** call `getMe`, and show a splash screen until it resolves (prevents login-page flicker)
- [x] `authSlice`: `user`, `permissions`, `status` (`idle | loading | authenticated | unauthenticated`)
- [x] On logout: call the API, reset the store (`api.util.resetApiState()`), redirect
- [x] CSRF: `SameSite=Lax` or `Strict` plus a CSRF header check on mutations if you use cross-site setups
- [x] **Electron caveat:** the renderer origin is `file://` or a custom protocol, so cookies behave differently. Either serve the renderer from a fixed origin, or in the desktop build store the refresh token via `safeStorage` through a preload bridge. Decide this before Phase 9.
- [x] Pages: Login, Forgot password, Reset password, Change password

## Phase 4: Routing and route protection

- [x] React Router with `createBrowserRouter` (use `HashRouter` in Electron production builds)
- [ ] **`ProtectedRoute`**: if unauthenticated, redirect to `/login` and remember the intended URL
- [x] **`RoleGuard`**: check the role, otherwise render a `403` page
- [x] **`PermissionGuard`** (`resource`, `action`) for finer-grained routes
- [ ] Route config as data: `{ path, element, roles?, permission? }`, so the router and sidebar read from one source (DRY)
- [x] Role-based default landing (customer → `/dashboard`, china employee → `/assignments`, etc.)
- [x] Lazy-load route chunks (`React.lazy` + `Suspense`)
- [x] `404` and `403` pages, route-level error boundary

## Phase 5: Role-based access in the UI

- [x] `usePermission()` hook, `can(resource, action)`
- [x] **`<Can resource="purchase_orders" action="approve">`** component to hide buttons, tabs, and menu items
- [x] Sidebar menu built from the route config, filtered by permissions
- [ ] Different dashboard per role, rendered from one `DashboardPage` switch
- [x] **Important:** UI hiding is only UX. The server enforces everything, and the client must handle `403` gracefully.
- [ ] Hide sensitive fields (cost price, profit) unless permitted, based on what the API returns, not only on role

## Phase 6: Shared UI building blocks (so features stay DRY)

- [x] `DashboardLayout` (sidebar, topbar, user menu, breadcrumbs, mobile drawer)
- [x] **`DataTable`**: columns config, server-side pagination, sorting, search, filters, row actions, loading skeleton, empty state
- [x] `useTableParams`: syncs page/limit/search/filter with the URL query string and feeds RTK Query args
- [x] Reusable `FormField` wrappers for react-hook-form + Zod, mapping server field errors onto the form
- [x] `StatusBadge` with one status→color map per domain (quotation, QC, shipment)
- [x] `ConfirmDialog`, `PageHeader`, `EmptyState`, `ErrorState` (with retry), `Skeletons`
- [x] `FileUploader` (drag-drop, preview, progress) for QC photos and documents
- [x] Toast helper: success from `message` in the API response, errors from the normalized error

## Phase 7: Feature modules (repeat the same pattern)

For each module: `*.api.ts` → types → Zod schema → list page → detail page → create/edit form.

- [x] `auth` and `profile`
- [x] `users` and `roles` (admin)
- [x] `customers`
- [x] `suppliers`
- [x] `product-requests`
- [x] `quotations` (approve/reject actions)
- [x] `purchase-orders`
- [ ] `quality-control` (photo gallery, checklist)
- [ ] `shipments` (consolidation UI, status timeline)
- [x] `customs`
- [x] `finance` (invoices, payments, order profit)
- [ ] `dashboard` (stat cards and charts)

Per-module checklist:

- [x] Loading, empty, error, and success states for every query
- [x] `providesTags` on queries and `invalidatesTags` on mutations
- [x] Optimistic updates only where safe (never for financial actions)
- [x] Form validation uses the same Zod schemas as the server where possible (shared package later)
- [x] Action buttons wrapped in `<Can>`
- [ ] Status timeline component driven by the API's status history

## Phase 8: Quality and polish

- [x] Global error boundary with a friendly fallback
- [ ] Debounced search, request cancellation on param change
- [ ] Polling (`pollingInterval`) for notifications and live statuses, upgrade to Socket.IO later
- [ ] Accessibility pass (labels, focus, keyboard navigation)
- [x] Dark mode and responsive checks
- [x] Tests: guards, `baseQueryWithReauth` (MSW), one full feature flow
- [ ] i18n setup (`react-i18next`), as English/Chinese/Bengali are likely needed

## Phase 9: Electron wrap

- [x] `electron-vite` with the existing React app as the renderer
- [x] `contextIsolation: true`, `nodeIntegration: false`, minimal `contextBridge` API
- [x] Resolve the cookie/origin strategy decided in Phase 3
- [ ] Auto-update (`electron-updater`), code signing, per-OS builds
- [ ] Native extras only if needed: file dialogs, notifications, barcode scanner, printing

## Suggested order

**Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → customers module end to end → the rest.**

Build `login → getMe → protected dashboard → customers list/create` first. When that works with cookies, refresh, and permissions, the rest is the same pattern repeated.

Want me to generate the code for Phases 0-5 (store, `baseApi` with reauth, auth slice, guards, route config, `Can` component) as a working scaffold?
