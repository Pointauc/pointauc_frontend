// eslint-disable-next-line import/prefer-default-export
export const getQueryValue = (url: string, queryName: string): string | null => {
  const regexp = new RegExp(`[?&]${queryName}=([^&]*)&|[?&]${queryName}=([^&]*)$`);
  const query = regexp.exec(url);
  return query && (query[1] || query[2]);
};
