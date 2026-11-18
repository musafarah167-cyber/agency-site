// Keep package downloads, temporary files and Next's caches inside this project.
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
const project = path.dirname(source);
const mode = process.argv[2];
if (!['install', 'dev'].includes(mode) || process.argv.length > 3)
  throw new Error('Use node website/local.mjs install or node website/local.mjs dev.');
const cache = path.join(project, '.codex', 'cache');
const env = {
  ...process.env,
  TMPDIR: path.join(cache, 'growth-site', 'tmp'),
  XDG_CACHE_HOME: path.join(cache, 'growth-site', 'xdg'),
  npm_config_cache: path.join(cache, 'npm'),
  npm_config_update_notifier: 'false',
  NEXT_TELEMETRY_DISABLED: '1',
};
for (const location of [env.TMPDIR, env.XDG_CACHE_HOME, env.npm_config_cache])
  await mkdir(location, { recursive: true });
const child =
  mode === 'install'
    ? spawn('npm', ['ci', '--include=dev', '--ignore-scripts', '--no-fund', '--no-audit'], {
        cwd: source,
        env,
        stdio: 'inherit',
      })
    : spawn(
        process.execPath,
        [
          path.join(source, 'node_modules/next/dist/bin/next'),
          'dev',
          '--webpack',
          '--hostname',
          '127.0.0.1',
          '--port',
          '3212',
        ],
        { cwd: source, env, stdio: 'inherit' }
      );
child.on('error', (err) => {
  console.error(err.message);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
