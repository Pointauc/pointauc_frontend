import { LotActionConfig } from '@components/BidsManagementConfirmation/actions/Lot.tsx';
import { GlobalActionConfig } from '@components/BidsManagementConfirmation/actions/Global.tsx';
import { PurchaseLog } from '@reducers/Purchases/Purchases.ts';
import array from '@utils/dataType/array.ts';
import { RedemptionStatus } from '@models/redemption.model.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';

export const pointsManagementPresets = {
  returnAllExcept: (id: string) => [new LotActionConfig('accept', id), new GlobalActionConfig('return')],
};

const toDto = (data: PurchaseLog[], action: Bid.Action) => {
  const groupedRewards = array.groupBy(data, (bid) => bid.rewardId ?? '');
  return {
    rewards: Object.entries(groupedRewards).map(([rewardId, bids]) => ({
      rewardId,
      redemptions: bids.map((bid) => bid.id),
    })),
    status: action === 'return' ? RedemptionStatus.Canceled : RedemptionStatus.Fulfilled,
  };
};

const actionToLogStatus = (action: Bid.Action) => {
  const map = {
    accept: PurchaseStatusEnum.accept,
    return: PurchaseStatusEnum.return,
  };

  return map[action];
};

const markStatus = (data: PurchaseLog[], allBids: PurchaseLog[], action: Bid.Action): PurchaseLog[] => {
  const set = new Set(data.map((bid) => bid.id));

  return allBids.map<PurchaseLog>((bid) => (set.has(bid.id) ? { ...bid, status: actionToLogStatus(action) } : bid));
};

const bidsManagementUtils = {
  presets: pointsManagementPresets,
  toDto,
  markStatus,
};

export default bidsManagementUtils;
