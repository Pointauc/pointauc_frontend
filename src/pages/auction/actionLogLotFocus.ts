export const AUCTION_LOT_FOCUS_EVENT = 'auction:focus-lot';
export const AUCTION_LOT_HIGHLIGHT_DURATION_MS = 2_000;

export interface AuctionLotFocusEventDetail {
  lotId: string | null;
}

export const focusAuctionLot = (lotId: string | null): void => {
  window.dispatchEvent(new CustomEvent<AuctionLotFocusEventDetail>(AUCTION_LOT_FOCUS_EVENT, { detail: { lotId } }));
};
