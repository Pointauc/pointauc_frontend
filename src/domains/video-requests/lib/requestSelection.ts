import { VideoRequest, VideoRequestNextStrategy } from '@domains/video-requests/model/types';

const compareCreatedAtAscending = (left: VideoRequest, right: VideoRequest) =>
  left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);

const getBidCost = (request: VideoRequest) => request.bidSnapshot?.cost ?? 0;

export const getWeightedRequestAmount = (request: VideoRequest) => Math.max(1, getBidCost(request));

export const selectNextVideoRequest = (
  requests: VideoRequest[],
  strategy: VideoRequestNextStrategy,
): VideoRequest | null => {
  if (requests.length === 0) {
    return null;
  }

  if (strategy === 'biggestBid') {
    return [...requests].sort(
      (left, right) => getBidCost(right) - getBidCost(left) || compareCreatedAtAscending(left, right),
    )[0];
  }

  return [...requests].sort(compareCreatedAtAscending)[0];
};
