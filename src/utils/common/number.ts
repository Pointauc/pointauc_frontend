export const numberUtils = {
  roundFixed: (value: number, digits: number): number => {
    const multiplier = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
  },
};
