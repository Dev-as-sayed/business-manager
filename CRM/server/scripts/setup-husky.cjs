const { execFileSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const huskyBin = path.join(projectRoot, 'node_modules', 'husky', 'bin.js');

if (!existsSync(huskyBin)) {
  process.exit(0);
}

let gitRoot;

try {
  gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();
} catch {
  process.exit(0);
}

const huskyDir = path.relative(gitRoot, path.join(projectRoot, '.husky'));

execFileSync(process.execPath, [huskyBin, huskyDir], {
  cwd: gitRoot,
  stdio: 'inherit',
});
