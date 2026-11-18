import fs from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import nodeProcess from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(sourceRoot, '..');
const usage = 'Usage: node website/build.mjs [--out <project-local output directory>]';
const args = nodeProcess.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log(usage);
  nodeProcess.exit(0);
}
if (
  args.length &&
  (args.length !== 2 || args[0] !== '--out' || !args[1] || args[1].startsWith('--'))
)
  throw new Error(usage);
const root = args.length
  ? path.resolve(nodeProcess.cwd(), args[1])
  : path.join(projectRoot, 'site');
const relativeOutput = path.relative(projectRoot, root);
if (relativeOutput !== 'site' && !relativeOutput.startsWith(`outputs${path.sep}`)) {
  throw new Error(
    'Output must be site/ or a directory inside this project’s outputs/. Nothing was written.'
  );
}
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const stateDir = path.join(sourceRoot, '.build-state');
const stateFile = path.join(stateDir, `${sha256(root)}.json`);
const safeRelative = (file) =>
  typeof file === 'string' &&
  !path.isAbsolute(file) &&
  !file.includes('\\') &&
  !file.includes('\0') &&
  !file.split('/').some((part) => !part || part === '.' || part === '..');

// Never follow symlinks, replace an unrelated website or delete an output tree.
async function checkPath(target) {
  const relative = path.relative(projectRoot, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
    throw new Error('Path leaves the project.');
  let current = projectRoot;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      if ((await fs.lstat(current)).isSymbolicLink())
        throw new Error(`Refusing symlink: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}
async function collectFiles(directory, prefix = '') {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink())
      throw new Error(`Refusing symlink: ${path.join(directory, entry.name)}`);
    if (entry.isDirectory())
      files.push(...(await collectFiles(path.join(directory, entry.name), relative)));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Not a regular file: ${relative}`);
  }
  return files;
}
async function writeBuild(files) {
  await checkPath(root);
  await checkPath(stateFile);
  let previous;
  try {
    previous = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (
    previous &&
    (previous.schemaVersion !== 1 || previous.output !== root || !Array.isArray(previous.files))
  )
    throw new Error('Unrecognised build record. Nothing was written.');
  const previousFiles = new Map();
  for (const entry of previous?.files || []) {
    if (!safeRelative(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256))
      throw new Error('Invalid build record. Nothing was written.');
    previousFiles.set(entry.path, entry.sha256);
  }
  const existing = await collectFiles(root);
  // A fresh checkout may include generated site/ without this computer's local
  // build record. Adopt it only when every existing byte matches this build.
  if (!previous) {
    for (const file of existing) {
      const planned = files.get(file);
      const actual = await fs.readFile(path.join(root, file));
      if (!planned || !actual.equals(planned)) {
        // When site/ is committed, a fresh clone can verify its previous export
        // directly against Git before replacing it with the new source.
        const indexed =
          relativeOutput === 'site' &&
          spawnSync('git', ['show', ':./site/' + file], {
            cwd: projectRoot,
            maxBuffer: 32 * 1024 * 1024,
          });
        if (!indexed || indexed.status !== 0 || !actual.equals(indexed.stdout))
          throw new Error(
            `Existing output has no matching build or Git record: ${file}. Nothing was written.`
          );
      }
      previousFiles.set(file, sha256(actual));
    }
  }
  for (const file of existing) {
    if (!previousFiles.has(file))
      throw new Error(
        `Output contains an untracked file: ${file}. Archive it before building. Nothing was written.`
      );
    if (sha256(await fs.readFile(path.join(root, file))) !== previousFiles.get(file))
      throw new Error(
        `Generated file was edited: ${file}. Preserve that edit in website/ before rebuilding. Nothing was written.`
      );
  }
  // Check every file/directory collision before the first output write. Such
  // structural changes need a fresh output folder rather than a partial build.
  const existingSet = new Set(existing);
  for (const file of files.keys()) {
    const segments = file.split('/');
    for (let i = 1; i < segments.length; i++) {
      const ancestor = segments.slice(0, i).join('/');
      if (files.has(ancestor) || existingSet.has(ancestor))
        throw new Error(
          `File/directory conflict at ${ancestor}. Archive the output and rebuild fresh. Nothing was written.`
        );
    }
    try {
      if ((await fs.lstat(path.join(root, file))).isDirectory())
        throw new Error(
          `Directory blocks output file ${file}. Archive the output and rebuild fresh. Nothing was written.`
        );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  await fs.mkdir(root, { recursive: true });
  for (const [file, data] of files) {
    const target = path.join(root, file);
    if (existingSet.has(file) && previousFiles.get(file) === sha256(data)) continue;
    await fs.mkdir(path.dirname(target), { recursive: true });
    const nextFile = target + '.' + randomUUID() + '.tmp';
    try {
      await fs.writeFile(nextFile, data, { flag: 'wx' });
      await fs.rename(nextFile, target);
    } finally {
      await fs.rm(nextFile, { force: true });
    }
  }
  // Remove only obsolete files recorded by this builder and verified above.
  // No recursive delete is used, even for an explicit --out directory.
  const stale = existing.filter((file) => !files.has(file));
  for (const file of stale) await fs.unlink(path.join(root, file));
  const obsoleteDirs = new Set();
  for (const file of stale) {
    let directory = path.dirname(path.join(root, file));
    while (directory !== root) {
      obsoleteDirs.add(directory);
      directory = path.dirname(directory);
    }
  }
  for (const directory of [...obsoleteDirs].sort((a, b) => b.length - a.length)) {
    try {
      await fs.rmdir(directory);
    } catch (error) {
      if (!['ENOENT', 'ENOTEMPTY'].includes(error.code)) throw error;
    }
  }
  const record = {
    schemaVersion: 1,
    output: root,
    files: [...files]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([file, data]) => ({ path: file, sha256: sha256(data) })),
  };
  await fs.mkdir(stateDir, { recursive: true });
  const nextState = path.join(stateDir, `${randomUUID()}.json.tmp`);
  await fs.writeFile(nextState, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
  await fs.rename(nextState, stateFile);
  console.log(`Built ${files.size} public files in ${path.relative(projectRoot, root)}/.`);
}

const scratch = path.join(projectRoot, '.codex', 'cache', 'growth-site');
const temp = path.join(scratch, 'tmp');
const cache = path.join(scratch, 'xdg');
for (const folder of [temp, cache]) {
  await checkPath(folder);
  await fs.mkdir(folder, { recursive: true });
}
const digest = createHash('sha256');
const inputs = ['package-lock.json', 'next.config.mjs', 'tsconfig.json'];
for (const dir of ['app', 'components', 'content', 'public']) {
  for (const file of await collectFiles(path.join(sourceRoot, dir))) inputs.push(dir + '/' + file);
}
for (const file of inputs.sort()) {
  digest.update(file + '\0');
  digest.update(await fs.readFile(path.join(sourceRoot, file)));
}
const next = path.join(sourceRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
await fs.access(next).catch(() => {
  throw new Error(
    'Install website dependencies with the project-local npm command in website/README.md first.'
  );
});
const built = spawnSync(nodeProcess.execPath, [next, 'build', '--webpack'], {
  cwd: sourceRoot,
  stdio: 'inherit',
  env: {
    ...nodeProcess.env,
    TMPDIR: temp,
    XDG_CACHE_HOME: cache,
    NEXT_TELEMETRY_DISABLED: '1',
    CLEARSIGN_BUILD_ID: digest.digest('hex').slice(0, 18),
  },
});
if (built.error) throw built.error;
if (built.status !== 0) nodeProcess.exit(built.status ?? 1);

const exported = path.join(sourceRoot, 'out');
await checkPath(exported);
const files = new Map();
for (const file of await collectFiles(exported)) {
  if (!safeRelative(file)) throw new Error('Unexpected export path: ' + file);
  files.set(file, await fs.readFile(path.join(exported, file)));
}
// Support previously shared .html bookmarks on both a plain file host and Netlify.
// Canonical routes use a trailing slash; aliases keep query strings and fragments.
const redirects = ['/brand', '/brand/', '/brand.html', '/brand/index.html'].map(
  (oldAddress) => oldAddress + ' /service-branding/ 301!'
);
for (const file of [...files.keys()]) {
  const match = /^([^/]+)\/index\.html$/.exec(file);
  if (!match || match[1] === '404' || match[1].startsWith('_')) continue;
  files.set(match[1] + '.html', files.get(file));
  redirects.push('/' + match[1] + '.html /' + match[1] + '/ 301!');
}
files.set('_redirects', Buffer.from(['/index.html / 301!', ...redirects].join('\n') + '\n'));
await writeBuild(files);
