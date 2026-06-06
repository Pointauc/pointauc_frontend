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

export const getSecondsFromIsoDuration = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const durationMatch = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!durationMatch) {
    return null;
  }

  const days = Number(durationMatch[1] ?? 0);
  const hours = Number(durationMatch[2] ?? 0);
  const minutes = Number(durationMatch[3] ?? 0);
  const seconds = Number(durationMatch[4] ?? 0);
  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : null;
};

export const getSecondsFromTwitchDuration = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const durationMatch = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!durationMatch) {
    return null;
  }

  const hours = Number(durationMatch[1] ?? 0);
  const minutes = Number(durationMatch[2] ?? 0);
  const seconds = Number(durationMatch[3] ?? 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : null;
};
