// Primitive parsers reused by multiple providers.
export const getYearFromDate = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const match = value.match(/^[+-]?(\d{4})/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

export const getNumericValue = (value: number | string | null | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const parsedNumber = Number(value);
  return Number.isFinite(parsedNumber) ? parsedNumber : null;
};

export const getRuntimeMinutesFromIsoDuration = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const durationMatch = value.match(/^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!durationMatch) {
    return null;
  }

  const hours = Number(durationMatch[1] ?? 0);
  const minutes = Number(durationMatch[2] ?? 0);
  const totalMinutes = hours * 60 + minutes;

  return totalMinutes > 0 ? totalMinutes : null;
};
