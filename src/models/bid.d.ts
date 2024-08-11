namespace Bid {
  import { ReactNode } from 'react';

  import { Purchase, PurchaseLog } from '@reducers/Purchases/Purchases.ts';
  import { GlobalActionConfig } from '@components/BidsManagementConfirmation/actions/Global.tsx';
  import { LotActionConfig } from '@components/BidsManagementConfirmation/actions/Lot.tsx';

  type Source = Integration.ID | 'API';

  type Item = Purchase;

  type Action = 'return' | 'accept';

  interface BaseActionConfig {
    type: Action;
    Title: (props: any) => ReactNode;

    canApply(bid: PurchaseLog): boolean;
  }

  type ActionConfig = LotActionConfig | GlobalActionConfig;
}
