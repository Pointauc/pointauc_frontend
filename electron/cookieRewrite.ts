const readAttributeName = (attribute: string): string => {
  return attribute.split('=')[0]?.trim().toLowerCase() ?? '';
};

const readAttributeValue = (attribute: string): string => {
  const separatorIndex = attribute.indexOf('=');
  if (separatorIndex === -1) {
    return '';
  }

  return attribute
    .slice(separatorIndex + 1)
    .trim()
    .replace(/^"|"$/g, '');
};

export const rewriteSetCookie = (cookie: string): string => {
  const parts = cookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return cookie;
  }

  const [nameValue, ...attributes] = parts;
  const rewrittenAttributes = attributes.flatMap((attribute) => {
    const attributeName = readAttributeName(attribute);
    if (attributeName === 'domain' || attributeName === 'secure' || attributeName === 'partitioned') {
      return [];
    }

    if (attributeName === 'samesite' && readAttributeValue(attribute).toLowerCase() === 'none') {
      return ['SameSite=Lax'];
    }

    return [attribute];
  });

  return [nameValue, ...rewrittenAttributes].join('; ');
};

export const rewriteSetCookieHeader = (value: string | string[] | undefined): string[] => {
  if (!value) {
    return [];
  }

  const cookieList = Array.isArray(value) ? value : [value];
  return cookieList.map((cookie) => rewriteSetCookie(cookie));
};
