import { ReactNode, useState } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { WheelItem } from '@models/wheel.model.ts';
import { getSlotFromSeed } from '@services/PredictionService';

import { WheelResolverProps } from './types';

const useNormalWheel = ({
  isTicketRevealed,
  resetTicket,
}: Pick<WheelResolverProps, 'isTicketRevealed' | 'resetTicket'>): Wheel.FormatHook => {
  const [items, setItems] = useState<WheelItem[]>([]);
  const { t } = useTranslation();

  const init = (items: WheelItem[]) => {
    setItems(items);
  };

  const getNextWinnerId = async ({
    generateSeed,
  }: Wheel.GetNextWinnerIdParams): Promise<Wheel.GetNextWinnerIdResult> => {
    const seed = await generateSeed();
    const winnerId = items[getSlotFromSeed(items, seed)].id;

    return { id: winnerId, isFinalSpin: true, finalWinnerId: winnerId };
  };

  const renderSubmitButton = (defaultButton: ReactNode): ReactNode => {
    if (isTicketRevealed) {
      const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        resetTicket();
      };

      return (
        <Button variant='contained' onClick={onClick}>
          {t('wheel.ticket.drawNewTicket')}
        </Button>
      );
    }

    return defaultButton;
  };

  return {
    items,
    init,
    getNextWinnerId,
    renderSubmitButton,
  };
};

export default useNormalWheel;
