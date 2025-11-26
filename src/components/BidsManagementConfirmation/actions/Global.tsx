import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ConfigProps {
  type: Bid.Action;
}

function GlobalActionTitle() {
  const { t } = useTranslation();

  return <Text>{t('bidsManagement.restBids')}</Text>;
}

export class GlobalActionConfig implements ConfigProps, Bid.BaseActionConfig {
  Title = GlobalActionTitle;

  constructor(public type: Bid.Action) {}

  canApply(): boolean {
    return true;
  }
}

export default GlobalActionTitle;
