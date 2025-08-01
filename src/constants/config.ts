interface Config {
  docs: {
    baseUrl: string;
  };
}

export const config: Config = {
  docs: {
    baseUrl: import.meta.env.VITE_DOCS_BASE_URL || '/docs',
  },
};
