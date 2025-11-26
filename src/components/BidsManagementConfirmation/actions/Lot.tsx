import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getSlot } from '@utils/slots.utils.ts';
import { RootState } from '@reducers';
import { PurchaseLog } from '@reducers/Purchases/Purchases.ts';

interface ConfigProps {
  type: Bid.Action;
  lotId: string;
}

interface TitleProps {
  config: ConfigProps;
}

function LotActionTitle({ config: { lotId } }: TitleProps) {
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const lot = useMemo(() => {
    return getSlot(slots, lotId);
  }, [lotId, slots]);

  return <Text>{t('bidsManagement.lotBids', { name: lot?.name })}</Text>;
}

export class LotActionConfig implements ConfigProps, Bid.BaseActionConfig {
  Title = LotActionTitle;

  constructor(
    public type: Bid.Action,
    public lotId: string,
  ) {}

  canApply(bid: PurchaseLog): boolean {
    return bid.target === this.lotId;
  }
}

export default LotActionTitle;
