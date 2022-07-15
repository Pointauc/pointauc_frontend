export interface PatchRedemptionDto {
  rewardId: string;
  redemptionId: string;
  status: string;
}

export enum RedemptionStatus {
  Canceled = 'CANCELED',
  Unfulfilled = 'UNFULFILLED',
  Fulfilled = 'FULFILLED',
}
