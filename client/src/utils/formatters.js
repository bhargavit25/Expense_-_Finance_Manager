/**
 * Formatting helpers for currency, percentages, and dates
 */

export function getCurrencySymbol(currency = 'INR') {
  switch (currency?.toUpperCase()) {
    case 'INR':
      return '₹';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'USD':
    case 'CAD':
    case 'AUD':
      return '$';
    default:
      return '₹';
  }
}

export function formatCurrency(amount, currency = 'INR') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const curr = currency || 'INR';
  try {
    const locale = curr.toUpperCase() === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (_) {
    const symbol = getCurrencySymbol(curr);
    return `${symbol}${num.toFixed(2)}`;
  }
}

export function formatPercentage(value) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${num.toFixed(1)}%`;
}

export function formatDate(dateString, format = 'medium') {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (format === 'input') {
    return date.toISOString().split('T')[0];
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(month, year) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
