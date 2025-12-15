import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ActionChipProps {
  type: Bid.Action;
}

const colorMap = {
  accept: 'yellow',
  return: 'green',
};

function ActionChip({ type }: ActionChipProps) {
  const { t } = useTranslation();

  return (
    <Badge color={colorMap[type]} variant='light' size='lg'>
      {t(`bidsManagement.action.${type}`)}
    </Badge>
  );
}

export default ActionChip;
