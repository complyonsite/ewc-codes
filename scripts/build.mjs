import { readFileSync, writeFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../ewc-codes.json', import.meta.url), 'utf8'));
writeFileSync(new URL('../src/data.ts', import.meta.url), '// Generated from ewc-codes.json by npm run build.\nimport type { EwcEntry } from "./index.js";\nexport const data: readonly EwcEntry[] = ' + JSON.stringify(data) + ';\n');
