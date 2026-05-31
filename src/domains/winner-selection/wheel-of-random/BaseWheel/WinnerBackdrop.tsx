import { Button, Checkbox, Group, Modal, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Key, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import BidsManagementDialog from '@components/BidsManagementConfirmation/Dialog';
import { pointsManagementPresets } from '@components/BidsManagementConfirmation/utils';
import {
  confirmLatestWinnerCandidate,
  rerollLatestWinnerCandidate,
} from '@domains/auction/history/model/activeAuctionHistorySlice';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers/index';
import { getSlot, getTotalSize } from '@utils/slots.utils';

import classes from './WinnerBackdrop.module.css';
import WinnerBackdropName from './WinnerBackdropName';
import WinnerStats from './WinnerStats/WinnerStats';

interface WinnerBackdropProps {
  currentSpinWinner: WheelItem;
  id: Key;
  finalWinner?: WheelItem | null;
  onDelete?: (showConfirmation?: boolean) => void;
  onReroll?: () => void;
  onReset?: () => void;
  dropOut?: boolean;
  showDeleteConfirmation?: boolean;
}

const WinnerBackdrop = (props: WinnerBackdropProps) => {
  const {
    currentSpinWinner,
    onDelete,
    onReroll,
    onReset,
    id,
    finalWinner: _finalWinner,
    dropOut,
    showDeleteConfirmation = true,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lots = useSelector((state: RootState) => state.slots.slots);
  const [localShowDeleteConfirmation, setLocalShowDeleteConfirmation] = useState<boolean>(showDeleteConfirmation);

  const finalWinner = dropOut ? _finalWinner : currentSpinWinner;

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [bidManagementOpen, setBidManagementOpen] = useState<boolean>(false);
  const [isLotDeleted, setIsLotDeleted] = useState<boolean>(false);
  const [isWinnerConfirmed, setIsWinnerConfirmed] = useState<boolean>(false);

  const finalWinnerLot = useMemo(
    () => (finalWinner?.id ? getSlot(lots, finalWinner?.id.toString()) : null),
    [finalWinner, lots],
  );

  const totalSum = useMemo(() => getTotalSize(lots), [lots]);

  const amountCategoryChance = useMemo<number | null>(() => {
    if (!finalWinnerLot) return null;
    const amountCategory = finalWinnerLot.amount ?? 0;
    const categorySum = lots.reduce((acc, lot) => {
      if (lot.amount && lot.amount <= amountCategory) {
        return acc + Number(lot.amount);
      }
      return acc;
    }, 0);
    return categorySum / totalSum;
  }, [finalWinnerLot, lots, totalSum]);

  const winChance = useMemo<number | null>(() => {
    if (!finalWinnerLot) return null;
    return (finalWinnerLot.amount ?? 0) / totalSum;
  }, [finalWinnerLot, totalSum]);

  const deleteWinner = () => {
    onDelete?.(localShowDeleteConfirmation);
    setDialogOpen(false);
    setIsLotDeleted(true);
    notifications.show({ message: t('wheel.lotWasDeleted'), color: 'green' });
  };

  const handleDeleteWinner = () => {
    if (showDeleteConfirmation) {
      setDialogOpen(true);
    } else {
      deleteWinner();
    }
  };

  const handleModalClose = () => {
    setDialogOpen(false);
    setLocalShowDeleteConfirmation(showDeleteConfirmation);
  };

  const handleConfirmWinner = (): void => {
    dispatch(confirmLatestWinnerCandidate());
    setIsWinnerConfirmed(true);
    notifications.show({
      title: t('auctionHistory.winner.savedTitle'),
      message: t('auctionHistory.winner.savedMessage'),
      color: 'green',
      autoClose: 8000,
    });
  };

  const handleRerollWinner = (): void => {
    dispatch(rerollLatestWinnerCandidate());
    if (dropOut) {
      onReset?.();
      return;
    }

    onReroll?.();
  };

  const pointsAction = useMemo(() => pointsManagementPresets.returnAllExcept(id as string), [id]);

  return (
    <div style={{ pointerEvents: 'all' }} className={classes.wheelWinner}>
      <WinnerBackdropName name={currentSpinWinner.name} winnerName={finalWinner?.name} dropout={dropOut} />
      <Group gap='sm'>
        {finalWinnerLot && (
          <>
            <Tooltip label={t('auctionHistory.winner.confirmTooltip')}>
              <Button
                type='button'
                onClick={handleConfirmWinner}
                variant='filled'
                color='green'
                disabled={isWinnerConfirmed}
              >
                {isWinnerConfirmed ? t('auctionHistory.winner.saved') : t('auctionHistory.winner.confirm')}
              </Button>
            </Tooltip>
            {!isWinnerConfirmed && (
              <Button
                type={dropOut ? 'button' : 'submit'}
                onClick={handleRerollWinner}
                variant='outline'
                color='yellow'
              >
                {t('auctionHistory.winner.reroll')}
              </Button>
            )}
          </>
        )}
        {onDelete && (
          <>
            {!isLotDeleted && (
              <Button onClick={handleDeleteWinner} variant='outline' color='red'>
                {t('wheel.deleteLot')}
              </Button>
            )}

            <Modal
              opened={dialogOpen}
              onClose={handleModalClose}
              title={t('wheel.deleteLotConfirmationModal.title')}
              size='lg'
              centered
            >
              <Text>{t('wheel.deleteLotConfirmationModal.description')}</Text>
              <Group justify='space-between' mt='md'>
                <Checkbox
                  label={t('wheel.deleteLotConfirmationModal.dontShowAgain')}
                  checked={!localShowDeleteConfirmation}
                  onChange={(event) => setLocalShowDeleteConfirmation(!event.target.checked)}
                />
                <Button onClick={deleteWinner} color='red'>
                  {t('wheel.deleteLotConfirmationModal.confirm')}
                </Button>
              </Group>
            </Modal>

            {/* <Button onClick={() => setBidManagementOpen(true)} variant='outline' color='blue'>
              {t('wheel.returnPointsToTheRest')}
            </Button> */}

            <BidsManagementDialog
              open={bidManagementOpen}
              onClose={() => setBidManagementOpen(false)}
              actions={pointsAction}
            >
              {t('bidsManagement.modalTitle.returnAllExceptWinner')}
            </BidsManagementDialog>
          </>
        )}
      </Group>

      {winChance && (
        <WinnerStats
          winChance={winChance}
          amountCategoryChance={amountCategoryChance}
          winnerAmount={finalWinnerLot?.amount}
        />
      )}
    </div>
  );
};

export default WinnerBackdrop;
