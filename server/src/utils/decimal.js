const { Prisma } = require('@prisma/client');

/**
 * Monetary Arithmetic Helper
 * Handles financial calculations with 2 decimal precision without floating point inaccuracies.
 */

// Converts any number/string/Decimal to standard 2-decimal number
function toNumber(val) {
  if (val === null || val === undefined) return 0;
  if (val instanceof Prisma.Decimal) {
    return parseFloat(val.toFixed(2));
  }
  const num = parseFloat(val);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Converts any number/string to Prisma.Decimal
function toDecimal(val) {
  if (val === null || val === undefined) return new Prisma.Decimal(0);
  if (val instanceof Prisma.Decimal) return val;
  return new Prisma.Decimal(toNumber(val).toFixed(2));
}

// Safely adds two monetary values
function add(a, b) {
  const decA = toDecimal(a);
  const decB = toDecimal(b);
  return decA.plus(decB);
}

// Safely subtracts b from a
function subtract(a, b) {
  const decA = toDecimal(a);
  const decB = toDecimal(b);
  return decA.minus(decB);
}

// Calculates percentage (a / b) * 100 with division by zero safety
function calculatePercentage(part, total) {
  const numPart = toNumber(part);
  const numTotal = toNumber(total);
  if (numTotal <= 0) return 0;
  return Math.round((numPart / numTotal) * 10000) / 100; // e.g. 75.45%
}

module.exports = {
  toNumber,
  toDecimal,
  add,
  subtract,
  calculatePercentage,
};
