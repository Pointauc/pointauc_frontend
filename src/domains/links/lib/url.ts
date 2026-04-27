import { store } from '@store';

const normalizeDomain = (domain: string): string => domain.trim().toLowerCase().replace(/^\.+/, '').replace(/\.$/, '');

export const getDomainFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return normalizeDomain(parsedUrl.hostname);
  } catch {
    return null;
  }
};

const checkIsDomainAllowed = (hostname: string, allowedDomains: string[]): boolean => {
  const normalizedHostname = normalizeDomain(hostname);

  return allowedDomains.some((domain) => {
    const normalizedAllowedDomain = normalizeDomain(domain);

    return normalizedHostname === normalizedAllowedDomain || normalizedHostname.endsWith(`.${normalizedAllowedDomain}`);
  });
};

export const checkIsUrlAllowed = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsedUrl = new URL(url);
    return checkIsDomainAllowed(parsedUrl.hostname, allowedDomains);
  } catch {
    return false;
  }
};

interface ExternalLinkConfirmationCheckParams {
  url: string;
}

export const checkShouldShowExternalLinkConfirmation = ({ url }: ExternalLinkConfirmationCheckParams): boolean => {
  const ignoreExternalLinkConfirmation = store.getState().aucSettings.settings.ignoreExternalLinkConfirmation;

  if (ignoreExternalLinkConfirmation) {
    return false;
  }

  const allowedDomains = store.getState().aucSettings.settings.allowedDomains;

  return !checkIsUrlAllowed(url, allowedDomains);
};

export const appendDomainToAllowList = (allowedDomains: string[], domain: string): string[] => {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return allowedDomains;
  }

  const normalizedAllowedDomainsSet = new Set(allowedDomains.map(normalizeDomain));
  normalizedAllowedDomainsSet.add(normalizedDomain);

  return [...normalizedAllowedDomainsSet];
};
