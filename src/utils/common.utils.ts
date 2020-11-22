// eslint-disable-next-line import/prefer-default-export
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const animateValue = (ref: HTMLInputElement, start: number, end: number, duration = 500): void => {
  let startTimestamp = 0;
  const step = (timestamp: number): void => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    ref.value = Math.floor(progress * (end - start) + start).toString();

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};
