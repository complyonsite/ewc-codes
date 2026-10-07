// Read only the four OGL-backed data/lookup modules; never load siteWastes or words.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

export function siteEntries(root) {
  const cache = new Map();
  function load(name) {
    if (!['lookup', 'codes', 'data', 'sources'].includes(name)) throw new Error(`Unexpected site module: ${name}`);
    if (cache.has(name)) return cache.get(name).exports;
    const module = { exports: {} };
    cache.set(name, module);
    const source = readFileSync(resolve(root, 'src/features/ewc', `${name}.ts`), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
    new Function('exports', 'require', 'module', outputText)(module.exports, id => load(id.replace(/^\.\//, '')), module);
    return module.exports;
  }
  return JSON.parse(JSON.stringify(load('lookup').ENTRIES));
}
