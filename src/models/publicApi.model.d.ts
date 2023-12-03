namespace PublicApi {
  interface Lot {
    fastId: number;
    id: string;
    name: string | null;
    amount: number | null;
    investors: string[];
  }

  interface LotQuery {
    id?: string;
    investorId?: string;
    bidId?: string;
  }

  interface LotUpdateData extends Partial<Lot> {
    amountChange?: number;
  }

  interface LotUpdateRequest {
    query: LotQuery;
    lot: LotUpdateData;
  }

  interface BidStatus {
    status: 'pending' | 'processed' | 'rejected' | 'notFound';
    lot?: {
      id: string;
    };
  }
}
