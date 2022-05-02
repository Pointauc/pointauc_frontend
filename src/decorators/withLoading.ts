const withLoading =
  <ParamsType, ReturnType>(
    setIsLoading: (isLoading: boolean) => void,
    callback: (...args: ParamsType[]) => Promise<ReturnType>,
  ) =>
  async (...args: ParamsType[]): Promise<ReturnType> => {
    try {
      setIsLoading(true);
      return await callback(...args);
    } finally {
      setIsLoading(false);
    }
  };

export default withLoading;
