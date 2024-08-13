import { FC, useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getUpdates } from '@utils/changelog.tsx';
import useStorageState from '@hooks/useStorageState.ts';
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
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
      <DialogTitle>{t('changelog.modal.title')}</DialogTitle>
      <DialogContent>
        <Changelog updates={updates} />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={() => setOpen(false)}>
          {t('bid.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangelogModal;
