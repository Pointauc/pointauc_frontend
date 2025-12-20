import { Modal } from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useStorageState from '@hooks/useStorageState.ts';
import { getCookie } from '@utils/common.utils.ts';
import { getUpdates } from '@domains/changelog/Updates/helpers.tsx';
import Changelog from '@domains/changelog/ui/Changelog';
import { getCurrentLanguage } from '@constants/language.constants';

const ChangelogModal: FC = () => {
  const { t } = useTranslation();
  const [lastVisit, setLastVisit] = useStorageState<string | null>('lastVisit', getCookie('lastVisit'));
  const [initialLastVisit] = useState<string | null>(lastVisit);
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage(i18n).key;
  const updates = initialLastVisit != null ? getUpdates(initialLastVisit, currentLanguage) : [];
  const [open, setOpen] = useState(!!updates.length);

  useEffect(() => {
    const date = new Date().toISOString();

    setLastVisit(date);
  }, [setLastVisit]);

  return (
    <Modal size='lg' opened={open} onClose={() => setOpen(false)} title={t('changelog.modal.title')}>
      <Changelog updates={updates} />
    </Modal>
  );
};

export default ChangelogModal;
