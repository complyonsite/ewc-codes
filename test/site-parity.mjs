import assert from 'node:assert/strict';
import test from 'node:test';
import { entries } from '../dist/index.js';
import { siteEntries } from '../scripts/site-data.mjs';

test('all 842 package records exactly match the site EWC data, including mirror candidates and notes', () => {
  assert.ok(process.env.COMPLYONSITE_SOURCE, 'Set COMPLYONSITE_SOURCE to the ComplyOnSite checkout.');
  assert.deepEqual(entries, siteEntries(process.env.COMPLYONSITE_SOURCE));
});
