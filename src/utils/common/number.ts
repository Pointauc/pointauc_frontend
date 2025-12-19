export const numberUtils = {
  roundFixed: (value: number, digits: number): number => {
    const multiplier = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
  },
  /**
   * Formats a number with thousand separators (dots) and decimal separator (comma)
   * @param value - The number to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted string like "1.000.123,25"
   */
  formatAmount: (value: number | string, decimals: number = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const fixed = num.toFixed(decimals);
    const [integerPart, decimalPart] = fixed.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
  },
};
