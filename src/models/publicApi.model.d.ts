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
  }

  interface LotUpdateRequest {
    query: LotQuery;
    lot: Partial<Lot>;
  }
}
