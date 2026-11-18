#!/usr/bin/env node
// Rebuild only the pinned Three.js derivatives. No downloads or dependencies are installed.
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const usage = 'Usage: node website/prepare-vendor.mjs --source-dir <three-0.187.0-package-root> --terser <pinned-bundle.min.js> [--output-dir <vendor-directory>]';
const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--source-dir', '--terser', '--output-dir'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || flags[args[i]]) {
    throw new Error(usage);
  }
  flags[args[i]] = args[i + 1];
}
if (!flags['--source-dir'] || !flags['--terser']) throw new Error(usage);

const sourceDir = resolve(flags['--source-dir']);
const terserPath = resolve(flags['--terser']);
const outputDir = flags['--output-dir'] ? resolve(flags['--output-dir']) : resolve(dirname(fileURLToPath(import.meta.url)), 'public/assets/vendor');
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRelative = relative(projectRoot, outputDir);
if (!outputRelative || outputRelative === '..' || outputRelative.startsWith(`..${sep}`) || isAbsolute(outputRelative)) {
  throw new Error('Vendor output must stay inside the ClearSign project. Nothing was written.');
}
let checkedPath = projectRoot;
for (const segment of outputRelative.split(sep)) {
  checkedPath = resolve(checkedPath, segment);
  try {
    if ((await lstat(checkedPath)).isSymbolicLink()) throw new Error(`Refusing symlink output: ${checkedPath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const sha256 = value => createHash('sha256').update(value).digest('hex');
const expectHash = (label, content, expected) => {
  const actual = sha256(content);
  if (actual !== expected) throw new Error(`${label}: SHA-256 mismatch (expected ${expected}, received ${actual}). Nothing was written.`);
};
const pins = [
  {
    file: 'three.module.js',
    sourceSha256: '104f56145899722094556490d787aae0617cc2fc3382f31df02d724ea1aee341',
    outputSha256: '056b357713ade405c1edb84237fc026aa6fe42b9d8cd3ac54d1d1c5480096f33'
  },
  {
    file: 'three.core.js',
    sourceSha256: '613e370f76638fdef83926642bf256dc9615684922de1ce1f63a8583e5d78578',
    outputSha256: 'b7b00c4b630f53b6fc60fabd8ef17ef866fc41976e1993ed02fd6db33ee09c45'
  }
];
const toolSha256 = 'e4ae9a64825ea7f53606c3ee01633f08b64e12000a30d3687f52b64977f9a652';
const licenseSha256 = '8b378ebe60e2fe500158cb0ac71cb5e8b7d92953c2abcc63a0eb90499653b5bc';
const pkg = JSON.parse(await readFile(resolve(sourceDir, 'package.json'), 'utf8'));
if (pkg.name !== 'three' || pkg.version !== '0.187.0') throw new Error('Expected the Three.js 0.187.0 package. Nothing was written.');
const license = await readFile(resolve(sourceDir, 'LICENSE'));
expectHash('Three.js license', license, licenseSha256);
expectHash('Terser bundle', await readFile(terserPath), toolSha256);
const inputs = await Promise.all(pins.map(async pin => {
  const source = await readFile(resolve(sourceDir, 'build', pin.file));
  expectHash(pin.file, source, pin.sourceSha256);
  return { ...pin, source };
}));

// Validate the exact tool bytes before loading executable code. This bundle is
// Terser 5.27.0 as declared by its Next.js 16.1.7 host, without an embedded version.
const require = createRequire(import.meta.url);
const { minify } = require(terserPath);
const options = { module: true, compress: true, mangle: true, format: { comments: /@license|SPDX|Copyright/i } };
const generated = [];
for (const input of inputs) {
  const result = await minify(input.source.toString('utf8'), options);
  if (result.error) throw result.error;
  if (typeof result.code !== 'string' || !result.code.includes('@license') || !result.code.includes('SPDX-License-Identifier: MIT')) {
    throw new Error(`${input.file}: minified output or retained MIT notice missing. Nothing was written.`);
  }
  expectHash(`${input.file} output`, result.code, input.outputSha256);
  generated.push({ ...input, code: result.code });
}

// Refuse to replace unexpected local vendor edits. Check everything before writing.
async function checkExisting(file, allowedHashes) {
  try {
    const existing = await readFile(resolve(outputDir, file));
    if (!allowedHashes.includes(sha256(existing))) throw new Error(`${file}: existing output has unrecognised edits. Nothing was written.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
for (const input of generated) await checkExisting(input.file, [input.sourceSha256, input.outputSha256]);
await checkExisting('THREE-LICENSE.txt', [licenseSha256]);
const provenance = {
  schemaVersion: 1,
  library: { name: 'three', version: pkg.version, runtimeRevision: '187', license: 'MIT', sourceUrl: 'https://registry.npmjs.org/three/-/three-0.187.0.tgz', sourceArchiveSha256: 'ff540832ded0cfe919764d24a3d88f3e2a05f23303f876423e4f893841e90728' },
  tool: { name: 'Terser', version: '5.27.0', versionEvidence: 'Declared by Next.js 16.1.7; this vendored bundle has no embedded version. Exact bundle SHA-256 is required.', sha256: toolSha256 },
  options: { module: true, compress: true, mangle: true, format: { comments: '/@license|SPDX|Copyright/i' } },
  outputEncoding: 'UTF-8, no appended newline',
  files: generated.map(({ file, source, code, sourceSha256, outputSha256 }) => ({ file, sourceBytes: source.length, outputBytes: Buffer.byteLength(code), sourceSha256, outputSha256 })),
  license: { file: 'THREE-LICENSE.txt', sha256: licenseSha256 },
  notes: ['Generated derivatives retain the original module URLs and public exports.', 'The generated assets run without the minifier or its Next.js host.', 'Archive URL and hash identify the preserved source; this script checks the package version, source modules, license and minifier locally and does not contact the registry.']
};
await mkdir(outputDir, { recursive: true });
for (const { file, code } of generated) await writeFile(resolve(outputDir, file), code);
// Existing matching license bytes remain unchanged; new output directories get the notice too.
await writeFile(resolve(outputDir, 'THREE-LICENSE.txt'), license);
await writeFile(resolve(outputDir, 'three-build-provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
console.log(JSON.stringify({ files: provenance.files, sourceBytes: provenance.files.reduce((n, f) => n + f.sourceBytes, 0), outputBytes: provenance.files.reduce((n, f) => n + f.outputBytes, 0) }, null, 2));
