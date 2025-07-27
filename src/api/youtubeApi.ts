import axios from 'axios';

import { YOUTUBE_API_KEYS } from '../constants/common.constants';
import { VideoSnippet } from '../models/youtube';

const withApiKeyRotation = async <T>(requestFn: (keyId: number) => Promise<T>, keyId = 0): Promise<T | undefined> => {
  try {
    if (!YOUTUBE_API_KEYS[keyId]) {
      return undefined;
    }
    return await requestFn(keyId);
  } catch (e) {
    if (keyId + 1 < YOUTUBE_API_KEYS.length) {
      return withApiKeyRotation(requestFn, keyId + 1);
    }
    return undefined;
  }
};

const fetchVideoStatistics = async (videoIds: string[], keyId: number): Promise<any> => {
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      id: videoIds.join(','),
      part: 'statistics',
      key: YOUTUBE_API_KEYS[keyId],
    },
  });

  console.log(data);

  return data.items.reduce((acc: Record<string, { viewCount: number; likeCount: number }>, item: any) => {
    acc[item.id] = {
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      likeCount: parseInt(item.statistics.likeCount, 10) || 0,
    };
    return acc;
  }, {});
};

const CACHE_KEYS = {
  SEARCH: 'search',
};

interface CacheData {
  data: VideoSnippet[];
  query: string;
}

const getCachedData = (query: string): CacheData | null => {
  const cachedData = localStorage.getItem(CACHE_KEYS.SEARCH);
  const parsedData = cachedData ? JSON.parse(cachedData) : null;

  return parsedData && parsedData.query === query ? parsedData.data : null;
};

const setCachedData = (query: string, data: CacheData): void => {
  localStorage.setItem(CACHE_KEYS.SEARCH, JSON.stringify({ data, query }));
};

export const searchYoutubeVideos = async (query: string): Promise<VideoSnippet[]> => {
  return withApiKeyRotation(async (keyId) => {
    const cachedResults = getCachedData(query);

    if (cachedResults) {
      return cachedResults.data;
    }

    // First, get the search results
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: 10,
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEYS[keyId],
      },
    });

    if (!data?.items?.length) {
      return [];
    }

    // Then, fetch statistics for all found videos
    const videoIds = data.items.map((item: any) => item.id.videoId);
    const statistics = await withApiKeyRotation((statsKeyId) => fetchVideoStatistics(videoIds, statsKeyId));

    const combinedResults = data.items.map((item: any) => ({
      ...item,
      snippet: {
        ...item.snippet,
        viewCount: statistics[item.id.videoId]?.viewCount || 0,
        likeCount: statistics[item.id.videoId]?.likeCount || 0,
      },
    }));

    setCachedData(query, { data: combinedResults, query });

    // Combine search results with statistics
    return combinedResults;
  });
};
