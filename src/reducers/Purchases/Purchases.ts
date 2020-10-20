import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum PurchaseStatusEnum {
  Processed = 'Processed',
  Deleted = 'Deleted',
}

export interface Purchase {
  timestamp: string;
  cost: number;
  username: string;
  message: string;
  color: string;
  id: number;
}

export interface PurchaseLog {
  purchase: Purchase;
  status: PurchaseStatusEnum;
}

interface PurchasesState {
  purchases: Purchase[];
  history: PurchaseLog[];
}

const initialState: PurchasesState = {
  purchases: [],
  history: [],
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    logPurchase(state, action: PayloadAction<PurchaseLog>): void {
      state.history = [...state.history, action.payload];
    },
    addPurchase(state, action: PayloadAction<Purchase>): void {
      state.purchases = [...state.purchases, action.payload];
    },
    removePurchase(state, action: PayloadAction<number>): void {
      state.purchases = state.purchases.filter(({ id }) => id !== action.payload);
    },
    resetPurchases(state): void {
      state.purchases = [];
    },
  },
});

export const { addPurchase, removePurchase, logPurchase, resetPurchases } = purchasesSlice.actions;

export default purchasesSlice.reducer;
