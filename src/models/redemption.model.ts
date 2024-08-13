export interface PatchRedemptionDto {
  rewardId: string;
  redemptionId: string;
  status: string;
}

export interface PatchRedemptionsDto {
  rewards: {
    rewardId: string;
    redemptions: string[];
  }[];
  status: string;
}

export enum RedemptionStatus {
  Canceled = 'CANCELED',
  Unfulfilled = 'UNFULFILLED',
  Fulfilled = 'FULFILLED',
}
