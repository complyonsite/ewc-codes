import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { entries, chapters, subChapters, lookup, search, isHazardous, mirrorPartners, validateCodeFormat, normaliseCode, referenceUrl } from '../dist/index.js';

test('complete dataset and JSON match; identifiers, headings and WM3 types are coherent', () => {
  assert.deepEqual(entries, JSON.parse(readFileSync(new URL('../ewc-codes.json', import.meta.url))));
  assert.equal(entries.length, 842);
  assert.equal(new Set(entries.map(e => e.code)).size, 842);
  assert.deepEqual(entries.map(e => e.code), entries.map(e => e.code).sort());
  assert.equal(chapters.length, 20);
  assert.equal(subChapters.length, 111);
  assert.equal(entries.filter(e => e.hazardous).length, 408);
  assert.deepEqual(Object.fromEntries(['AH', 'AN', 'MH', 'MN'].map(t => [t, entries.filter(e => e.type === t).length])), { AH: 235, AN: 256, MH: 173, MN: 178 });
  for (const e of entries) {
    assert.equal(lookup(e.code), e);
    assert.equal(lookup(e.display), e);
    assert.equal(e.hazardous, ['AH', 'MH'].includes(e.type));
    assert.equal(e.chapter.code, e.code.slice(0, 2));
    assert.equal(e.subChapter.code, e.code.slice(0, 4));
    assert.ok(e.description && e.chapter.title && e.subChapter.title);
  }
});

test('explicit mirror links are reciprocal and opposite MH/MN entries; inferred candidates stay separate', () => {
  assert.equal(entries.filter(e => e.mirrorPartners.length).length, 302);
  assert.equal(entries.filter(e => e.mirrorPartners.length || e.subChapterPartners.length).length, 343);
  for (const entry of entries) {
    for (const partner of mirrorPartners(entry.code)) {
      assert.ok(partner.mirrorPartners.includes(entry.code));
      assert.deepEqual([entry.type, partner.type].sort(), ['MH', 'MN']);
      assert.notEqual(entry.hazardous, partner.hazardous);
    }
    for (const code of entry.subChapterPartners) {
      assert.ok(lookup(code), code);
      assert.equal(lookup(code).subChapter.code, entry.subChapter.code);
      assert.notEqual(lookup(code).hazardous, entry.hazardous);
    }
  }
  assert.deepEqual(mirrorPartners('17 09 04').map(e => e.code), ['170901', '170902', '170903']);
  assert.deepEqual(mirrorPartners('170204').map(e => e.code), ['170201', '170202', '170203']);
  assert.deepEqual(mirrorPartners('160122'), []);
  assert.deepEqual(lookup('160122').subChapterPartners, ['160121', '160108', '160109']);
});

test('format validation is distinct from code existence and hazard classification', () => {
  for (const value of ['170903', '17 09 03*', '17-09-03', '17.09.03', ' 17 09 03 * ', '17  09  03']) {
    assert.equal(validateCodeFormat(value), true, value);
    assert.equal(normaliseCode(value), '170903');
    assert.equal(isHazardous(value), true);
  }
  for (const value of ['', '17090', '1709030', '17-09.03', 'code 170903', '17 0903', '1709 03', '17/09/03', '170903**']) {
    assert.equal(validateCodeFormat(value), false, value);
    assert.equal(lookup(value), undefined);
  }
  assert.equal(validateCodeFormat('999999'), true);
  assert.equal(lookup('999999'), undefined);
  assert.equal(isHazardous('999999'), undefined);
  assert.equal(isHazardous('170904*'), false, 'a supplied asterisk does not override the official list');
  assert.deepEqual(mirrorPartners('999999'), []);
});

test('search handles official text, headings, prefixes, exact and unknown codes without synonyms', () => {
  assert.deepEqual(search(''), []);
  assert.deepEqual(search('17 09 04').map(e => e.code), ['170904']);
  assert.deepEqual(search('99 99 99'), []);
  assert.deepEqual(search('17-09').map(e => e.code), ['170901', '170902', '170903', '170904']);
  assert.ok(search('asbestos').some(e => e.code === '170605'));
  assert.ok(search('CONSTRUCTION wood').some(e => e.code === '170201'));
  assert.equal(search('17').length, entries.filter(e => e.chapter.code === '17').length);
  assert.deepEqual(search('xyz-unknown-material'), []);
});

test('published entries are immutable and reference links point at code pages', () => {
  assert.throws(() => { entries[0].hazardous = true; }, TypeError);
  assert.throws(() => { entries[0].chapter.title = 'changed'; }, TypeError);
  assert.throws(() => { lookup('170904').mirrorPartners.push('999999'); }, TypeError);
  assert.equal(referenceUrl('17 09 04'), 'https://complyonsite.com/tools/ewc-code-finder?code=17-09-04');
  assert.equal(referenceUrl('999999'), undefined);
});
