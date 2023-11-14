import { FC, useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';

import { getUpdates } from '@utils/changelog.ts';

import Changelog from '../Changelog';

const ChangelogModal: FC = () => {
  const updates = useMemo(() => getUpdates(), []);
  const [open, setOpen] = useState(updates.length !== 0);

  useEffect(() => {
    const date = dayjs().format('YYYY-MM-DD');

    document.cookie = `lastVisit=${date}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
  }, []);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
      <DialogTitle>Что нового?</DialogTitle>
      <DialogContent>
        <Changelog updates={updates} />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={() => setOpen(false)}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangelogModal;
