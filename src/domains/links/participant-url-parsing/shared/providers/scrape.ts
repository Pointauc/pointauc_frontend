// Generic HTML scraping provider used by source-specific parsers.
import axios from 'axios';

export interface ScrapeHtmlPageParams {
  url: string;
  signal?: AbortSignal;
}

export const scrapeHtmlPage = async (params: ScrapeHtmlPageParams): Promise<string> => {
  const { data } = await axios.get<string>(params.url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
    responseType: 'text',
    signal: params.signal,
  });
  return data;
};
