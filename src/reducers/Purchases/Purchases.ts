import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Purchase {
  timestamp: string;
  cost: number;
  username: string;
  message: string;
  color: string;
  id: number;
}

interface PurchasesState {
  purchases: Purchase[];
}

const initialState: PurchasesState = {
  purchases: [],
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    addPurchase(state, action: PayloadAction<Purchase>): void {
      state.purchases = [...state.purchases, action.payload];
    },
    removePurchase(state, action: PayloadAction<number>): void {
      state.purchases = state.purchases.filter(({ id }) => id !== action.payload);
    },
  },
});

export const { addPurchase, removePurchase } = purchasesSlice.actions;

export default purchasesSlice.reducer;
