export const ARCHIVE_DB_NAME = 'pointauc-archive';
export const ARCHIVE_STORE_NAME = 'archives';
export const AUTOSAVE_ID = 'autosave';

export const QUERY_KEYS = {
  archives: ['archives'] as const,
  archive: (id: string) => ['archives', id] as const,
  autosave: ['archives', 'autosave'] as const,
};

