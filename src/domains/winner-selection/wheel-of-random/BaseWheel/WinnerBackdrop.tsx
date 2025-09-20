import React, { Key, useMemo, useState } from 'react';
import { Button, Modal, Text, Group, Checkbox } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { notifications } from '@mantine/notifications';

import BidsManagementDialog from '@components/BidsManagementConfirmation/Dialog';
import { pointsManagementPresets } from '@components/BidsManagementConfirmation/utils';

import WinnerBackdropName from './WinnerBackdropName';

interface WinnerBackdropProps {
  name: string;
  id: Key;
  winnerName?: string;
  onDelete?: (showConfirmation?: boolean) => void;
  dropOut?: boolean;
  showDeleteConfirmation?: boolean;
}

const WinnerBackdrop = (props: WinnerBackdropProps) => {
  const { name, onDelete, id, winnerName, dropOut, showDeleteConfirmation = true } = props;
  const { t } = useTranslation();
  const [localShowDeleteConfirmation, setLocalShowDeleteConfirmation] = useState<boolean>(showDeleteConfirmation);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [bidManagementOpen, setBidManagementOpen] = useState<boolean>(false);
  const [isLotDeleted, setIsLotDeleted] = useState<boolean>(false);

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

  const pointsAction = useMemo(() => pointsManagementPresets.returnAllExcept(id as string), [id]);

  return (
    <div style={{ pointerEvents: 'all' }} className='wheel-winner'>
      <WinnerBackdropName name={name} winnerName={winnerName} dropout={dropOut} />
      <Group gap='sm'>
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

            <Button onClick={() => setBidManagementOpen(true)} variant='outline' color='blue'>
              {t('wheel.returnPointsToTheRest')}
            </Button>

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
    </div>
  );
};

export default WinnerBackdrop;
