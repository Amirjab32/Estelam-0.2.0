import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gregorianToJalali,
  jalaliToGregorian,
  toPersianDigits,
  toEnglishDigits,
  formatPersianNumber,
  cleanPersianText,
} from './jalali.ts';

test('gregorianToJalali correctly converts Nowruz 2026', () => {
  // 2026-03-21 is 1 Farvardin 1405
  const j = gregorianToJalali(2026, 3, 21);
  assert.equal(j.jy, 1405);
  assert.equal(j.jm, 1);
  assert.equal(j.jd, 1);
});

test('jalaliToGregorian correctly converts 1405-01-01 back to Gregorian', () => {
  const g = jalaliToGregorian(1405, 1, 1);
  assert.equal(g.gy, 2026);
  assert.equal(g.gm, 3);
  assert.equal(g.gd, 21);
});

test('converts Persian digits accurately', () => {
  assert.equal(toPersianDigits(1234567890), '۱۲۳۴۵۶۷۸۹۰');
  assert.equal(toEnglishDigits('۱۲۳۴۵۶۷۸۹۰'), '1234567890');
});

test('formatPersianNumber formats with Persian separators', () => {
  assert.equal(formatPersianNumber(1000000), '۱٬۰۰۰٬۰۰۰');
  assert.equal(formatPersianNumber(25000), '۲۵٬۰۰۰');
});

test('cleanPersianText normalizes Arabic characters and half-spaces', () => {
  const input = 'علي  مي رود به كلاس ها';
  const output = cleanPersianText(input);
  // Ali should have Persian 'ی', 'می رود' should have half space, 'کلاس ها' should have half space
  assert.ok(output.includes('علی'));
  assert.ok(output.includes('کلاس'));
  assert.ok(output.includes('می\u200cرود'));
  assert.ok(output.includes('کلاس\u200cها'));
});
