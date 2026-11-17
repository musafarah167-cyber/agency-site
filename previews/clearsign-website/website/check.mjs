// Dependency-free checks for generated local pages and their referenced files.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {services} from './content/services.mjs';

const source=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(source,'..');
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--dir')) throw new Error('Usage: node website/check.mjs [--dir <generated website>]');
const root=args.length?path.resolve(args[1]):path.join(project,'site');
const inside=(folder,target)=>target===folder || target.startsWith(`${folder}${path.sep}`);
if(!inside(project,root) || root===project) throw new Error('The generated website must be inside this project.');
async function walk(directory,prefix='') {
  const result=[];
  for(const entry of await fs.readdir(directory,{withFileTypes:true})) {
    const file=prefix?`${prefix}/${entry.name}`:entry.name;
    if(entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${file}`);
    if(entry.isDirectory()) result.push(...await walk(path.join(directory,entry.name),file));
    else if(entry.isFile()) result.push(file);
    else throw new Error(`Unexpected non-file: ${file}`);
  }
  return result.sort();
}
const files=await walk(root);
const fileSet=new Set(files);
const expectedPages=['index.html','solutions.html','industries.html','about.html','contact.html','brand.html',...services.map(service=>service.filename)].sort();
const pages=files.filter(file=>file.endsWith('.html'));
if(JSON.stringify(pages)!==JSON.stringify(expectedPages)) throw new Error('Generated HTML page list does not match the eleven current pages.');
const errors=[];
const references=[];
for(const file of files) {
  if(!/\.(html|css|js)$/.test(file)) continue;
  const text=await fs.readFile(path.join(root,file),'utf8');
  let matches=[];
  if(file.endsWith('.html')) {
    matches=[...text.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/g)].map(match=>match[1]);
    if(!/<html\s+lang="en-GB"/.test(text)) errors.push(`${file}: missing British English document language`);
    if(!/<meta\s+name="robots"\s+content="noindex,nofollow"/.test(text)) errors.push(`${file}: missing preview indexing restriction`);
  }
  if(file.endsWith('.css')) matches=[...text.matchAll(/url\(\s*["']?([^"')]+)/g)].map(match=>match[1]);
  if(file.endsWith('.js')) matches=[...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g)].map(match=>match[1]);
  for(const value of matches) {
    if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#|%23)/i.test(value)) continue;
    const pathname=decodeURIComponent(value.split(/[?#]/)[0]);
    if(!pathname) continue;
    const target=path.resolve(path.dirname(path.join(root,file)),pathname);
    references.push({file,value});
    if(!inside(root,target) || !fileSet.has(path.relative(root,target).split(path.sep).join('/'))) errors.push(`${file}: missing or escaping reference ${value}`);
  }
}
// Prove that copied styling, runtime code, logos, images, fonts and notices are
// exactly the authored source, including the unchanged C fallback and geometry.
for(const file of await walk(path.join(source,'static'))) {
  if(!fileSet.has(file)) { errors.push(`Missing static file: ${file}`); continue; }
  const [authored,generated]=await Promise.all([fs.readFile(path.join(source,'static',file)),fs.readFile(path.join(root,file))]);
  if(!authored.equals(generated)) errors.push(`Static file differs from source: ${file}`);
}
if(errors.length) throw new Error(errors.join('\n'));
console.log(`Checked ${pages.length} pages, ${files.length} files and ${references.length} local references. No missing files; static output matches its source.`);
