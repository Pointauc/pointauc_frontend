import { PurchaseStatusEnum } from '../reducers/Purchases/Purchases';

export const COLORS = {
  PURCHASE_STATUS: {
    [PurchaseStatusEnum.Deleted]: '#F08080',
    [PurchaseStatusEnum.Processed]: '#AED581',
  },
};
