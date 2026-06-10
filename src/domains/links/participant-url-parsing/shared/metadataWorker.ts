const METADATA_WORKER_URL = import.meta.env.VITE_METADATA_WORKER_URL || import.meta.env.VITE_KINOPOISK_METADATA_WORKER_URL;

export const getMetadataWorkerUrl = (path: string): string => {
  if (!METADATA_WORKER_URL) {
    throw new Error('Metadata worker provider is not configured: VITE_METADATA_WORKER_URL is missing.');
  }

  const baseUrl = METADATA_WORKER_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};
