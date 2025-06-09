export const calcBackgroundOpacity = (opacity: number): number => {
  if (opacity < 0.1) {
    return 0;
  }

  return (opacity - 0.1) * 0.8;
};

export const calcUiElementsOpacity = (opacity: number): number => {
  return Math.min(opacity * 0.65 + 0.15, 0.8);
};
