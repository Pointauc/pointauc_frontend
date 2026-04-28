// JSON-LD extraction helpers for scraped HTML pages.
export interface JsonLdMovieData {
  '@type'?: string | string[];
  name?: string;
  datePublished?: string;
  duration?: string;
  aggregateRating?: {
    ratingValue?: number | string;
  };
}

const parseJsonLdBlocksFromHtml = (html: string): JsonLdMovieData[] => {
  const scriptMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const parsedBlocks: JsonLdMovieData[] = [];

  for (const scriptMatch of scriptMatches) {
    const jsonText = scriptMatch[1]?.trim();
    if (!jsonText) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(jsonText);
      if (Array.isArray(parsedValue)) {
        parsedBlocks.push(...parsedValue);
        continue;
      }

      parsedBlocks.push(parsedValue);
    } catch {
      continue;
    }
  }

  return parsedBlocks;
};

const checkIsJsonLdType = (jsonLdBlock: JsonLdMovieData, requiredType: string): boolean => {
  if (!jsonLdBlock['@type']) {
    return false;
  }

  if (Array.isArray(jsonLdBlock['@type'])) {
    return jsonLdBlock['@type'].some((value) => value === requiredType);
  }

  return jsonLdBlock['@type'] === requiredType;
};

export const getJsonLdByType = (html: string, requiredType: string): JsonLdMovieData | null => {
  const parsedJsonLdBlocks = parseJsonLdBlocksFromHtml(html);
  return parsedJsonLdBlocks.find((block) => checkIsJsonLdType(block, requiredType)) ?? parsedJsonLdBlocks[0] ?? null;
};
