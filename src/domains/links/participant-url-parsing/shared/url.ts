// URL/domain helpers shared by parser orchestration.
export const normalizeDomain = (domain: string): string => domain.trim().toLowerCase().replace(/^www\./, '');

export const extractDomainFromUrl = (href: string): string | null => {
  try {
    return new URL(href).hostname;
  } catch {
    return null;
  }
};
