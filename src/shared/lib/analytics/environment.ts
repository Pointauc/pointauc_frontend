export const getAnalyticsEnvironment = (): string => {
  return import.meta.env.VITE_ANALYTICS_ENVIRONMENT || import.meta.env.MODE;
};
