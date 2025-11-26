import { Modal } from '@mantine/core';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useStorageState from '@hooks/useStorageState.ts';
import { getUpdates } from '@utils/changelog.tsx';
import { getCookie } from '@utils/common.utils.ts';

import Changelog from '../Changelog';

const ChangelogModal: FC = () => {
  const { t } = useTranslation();
  const [lastVisit, setLastVisit] = useStorageState<string | null>('lastVisit', getCookie('lastVisit'));
  const [initialLastVisit] = useState<string | null>(lastVisit);
  const updates = useMemo(() => (initialLastVisit != null ? getUpdates(initialLastVisit) : []), [initialLastVisit]);
  const [open, setOpen] = useState(!!updates.length);

  useEffect(() => {
    const date = new Date().toISOString();

    setLastVisit(date);
  }, [setLastVisit]);

  return (
    <Modal opened={open} onClose={() => setOpen(false)} title={t('changelog.modal.title')}>
      <Changelog updates={updates} />
    </Modal>
  );
};

export default ChangelogModal;
