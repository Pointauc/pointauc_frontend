const withLoading = (setIsLoading: (isLoading: boolean) => void, callback: Function) => async (
  ...args: unknown[]
): Promise<void> => {
  try {
    setIsLoading(true);
    await callback(...args);
  } finally {
    setIsLoading(false);
  }
};

export default withLoading;
