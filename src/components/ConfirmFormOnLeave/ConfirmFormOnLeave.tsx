import { FC, ReactNode, useCallback, useState } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ConfirmFormOnLeaveProps {
  isDirtyForm: boolean;
  onSubmit?: () => void;
  content?: (onClose: () => void, onConfirm: () => void) => ReactNode;
}

const ConfirmFormOnLeave: FC<ConfirmFormOnLeaveProps> = ({ onSubmit, isDirtyForm, content }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nextLocation, setNextLocation] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useBlocker(({ nextLocation }) => {
    const { state, pathname } = nextLocation;
    if (isDirtyForm && !state?.forcePush) {
      setIsOpen(true);
      setNextLocation(pathname);

      return true;
    }

    return false;
  });

  const handleClose = useCallback(
    () => navigate(nextLocation, { state: { forcePush: true } }),
    [navigate, nextLocation],
  );
  const handleConfirm = useCallback(() => {
    onSubmit?.();
    handleClose();
  }, [handleClose, onSubmit]);

  if (content && isOpen) return <>{content(handleClose, handleConfirm)}</>;

  return (
    <Modal title={t('common.unsavedChanges')} opened={isOpen} onClose={handleClose}>
      <Group justify='flex-end'>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleConfirm} color='primary' autoFocus>
          {t('common.apply')}
        </Button>
      </Group>
    </Modal>
  );
};

export default ConfirmFormOnLeave;
