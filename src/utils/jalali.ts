/**
 * Jalali (Solar Hijri) conversion algorithms & Persian text formatting utilities
 */

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

/**
 * Converts Gregorian date to Jalali (Solar Hijri) date
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];

  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
}

/**
 * Converts Jalali date to Gregorian date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const sal_a = [
    0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  const gd = days + 1;

  return { gy, gm, gd };
}

/**
 * Convert numbers to Persian digits (۰-۹)
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Convert Persian digits to English digits (0-9)
 */
export function toEnglishDigits(input: string): string {
  if (!input) return '';
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = input;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianDigits[i], i.toString()).replace(arabicDigits[i], i.toString());
  }
  return res;
}

/**
 * Format numbers with Persian thousands separators
 */
export function formatPersianNumber(value: number | string): string {
  if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
    return '۰';
  }
  const parts = Number(value).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return toPersianDigits(parts.join('.'));
}

/**
 * Standardize Persian typography: cleans Arabic letters to Persian, fixes half-spaces
 */
export function cleanPersianText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // Replace Arabic Yeh and Kaf
  cleaned = cleaned.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  // Replace Arabic decorative marks
  cleaned = cleaned.replace(/[\u064B-\u065F\u0670]/g, '');
  // Normalize multi-spaces
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  // Insert zero-width non-joiner (نیم‌فاصله) for "می" and "نمی" prefixes
  cleaned = cleaned.replace(/(^|\s)(می|نمی)\s+/g, '$1$2\u200c');
  // Insert zero-width non-joiner for "ها", "تر", "ترین", "های" suffixes
  cleaned = cleaned.replace(/\s+(ها|های|تر|ترین|ام|ات|اش|مان|تان|شان)(?=$|\s|[.,;:!؟])/g, '\u200c$1');

  return cleaned.trim();
}

/**
 * Get current Jalali date formatted in Persian
 */
export function getCurrentPersianDate(): {
  dayName: string;
  day: number;
  monthName: string;
  monthNumber: number;
  year: number;
  fullDateString: string;
} {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // Day of week: JS Date getDay() 0 is Sunday, 6 is Saturday
  // In Persian calendar: Saturday (شنبه) is 0
  const jsDay = now.getDay();
  const persianDayIdx = (jsDay + 1) % 7;
  const dayName = PERSIAN_WEEKDAYS[persianDayIdx];
  const monthName = PERSIAN_MONTHS[j.jm - 1];

  return {
    dayName,
    day: j.jd,
    monthName,
    monthNumber: j.jm,
    year: j.jy,
    fullDateString: `${dayName}، ${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`,
  };
}
