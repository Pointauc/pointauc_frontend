import React, { useMemo } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import BidsManagementDialog from '@components/BidsManagementConfirmation/Dialog.tsx';
import { GlobalActionConfig } from '@components/BidsManagementConfirmation/actions/Global.tsx';
import { LotActionConfig } from '@components/BidsManagementConfirmation/actions/Lot.tsx';
import { RootState } from '@reducers';
import { sortSlots } from '@utils/common.utils.ts';

const BidsFastActions = () => {
  const { t } = useTranslation();
  const [actions, setActions] = React.useState<Bid.ActionConfig[] | null>(null);

  const { slots } = useSelector((root: RootState) => root.slots);
  const firstSlot = useMemo(() => sortSlots(slots)[0], [slots]);

  return (
    <Stack spacing={2}>
      <Typography variant='h5'>{t('history.fastBidsActions')}</Typography>
      <Stack direction='row' spacing={3}>
        <Stack direction='row' spacing={1}>
          <Button onClick={() => setActions([new GlobalActionConfig('return')])} variant='outlined' color='primary'>
            {t('bidsManagement.modalTitle.returnAll')}
          </Button>
          <Button
            onClick={() => setActions([new LotActionConfig('accept', firstSlot.id), new GlobalActionConfig('return')])}
            variant='outlined'
            color='primary'
          >
            {t('bidsManagement.modalTitle.returnAllExceptFirst')}
          </Button>
        </Stack>
        <Button onClick={() => setActions([new GlobalActionConfig('accept')])} variant='outlined' color='primary'>
          {t('bidsManagement.modalTitle.acceptAll')}
        </Button>

        <BidsManagementDialog open={actions !== null} actions={actions ?? []} onClose={() => setActions(null)} />
      </Stack>
    </Stack>
  );
};

export default BidsFastActions;
