import { writeFileSync } from 'node:fs';
import { siteEntries } from './site-data.mjs';
const root = process.env.COMPLYONSITE_SOURCE;
if (!root) throw new Error('Set COMPLYONSITE_SOURCE to the ComplyOnSite checkout.');
const entries = siteEntries(root);
if (entries.length !== 842) throw new Error(`Expected 842 codes, got ${entries.length}`);
writeFileSync(new URL('../ewc-codes.json', import.meta.url), JSON.stringify(entries, null, 2) + '\n');
console.log(`Exported ${entries.length} entries from the site.`);
