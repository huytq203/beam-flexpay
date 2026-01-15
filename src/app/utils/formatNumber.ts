// utils/format.ts

interface FormatNumberOptions {
  decimals?: number;        // Số chữ số thập phân
  locale?: string;          // 'vi-VN', 'en-US'
  currency?: string;        // 'VND', 'USD'
  separator?: ',' | '.';    // Dấu phân cách
}

/**
 * Format number với nhiều options
 */
export function formatNumber(
  value: number | string,
  options: FormatNumberOptions = {}
): string {
  const {
    decimals,
    locale = 'en-US',
    currency,
    separator = ','
  } = options;

  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';

  // Format với currency
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 0,
    }).format(num);
  }

  // Format thường
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 2,
  }).format(num);

  // Thay đổi separator nếu cần
  if (separator === '.' && locale === 'en-US') {
    return formatted.replace(/,/g, '.');
  }

  return formatted;
}

/**
 * Format currency VND
 * @example formatCurrency(1000000) => "1,000,000 ₫"
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0 ₫';
  
  return `${num.toLocaleString('en-US')} ₫`;
}

/**
 * Format currency VND ngắn gọn
 * @example formatCurrencyShort(1000000) => "1M ₫"
 */
export function formatCurrencyShort(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0 ₫';

  const billion = 1_000_000_000;
  const million = 1_000_000;
  const thousand = 1_000;

  if (num >= billion) {
    return `${(num / billion).toFixed(1)}B ₫`;
  }
  if (num >= million) {
    return `${(num / million).toFixed(1)}M ₫`;
  }
  if (num >= thousand) {
    return `${(num / thousand).toFixed(1)}K ₫`;
  }
  
  return `${num.toLocaleString('en-US')} ₫`;
}

/**
 * Parse formatted number về number
 * @example parseNumber("1,000,000") => 1000000
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[,\.]/g, '');
  return parseFloat(cleaned) || 0;
}