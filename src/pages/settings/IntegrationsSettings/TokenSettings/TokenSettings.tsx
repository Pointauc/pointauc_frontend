import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, Link, OutlinedInput, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useDispatch } from 'react-redux';

import { loadToken, updateToken } from '@api/tokenApi.ts';
import withLoading from '@decorators/withLoading.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import { AlertTypeEnum } from '@models/alert.model.ts';
import './TokenSettings.scss';

const TokenSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadTokenData = async () => {
      setToken(await loadToken());
    };

    if (opened) {
      withLoading(setLoading, loadTokenData)();
    }
  }, [opened]);

  const resetToken = async (): Promise<void> => {
    await withLoading(setLoading, async () => setToken(await updateToken()))();
    dispatch(addAlert({ message: t('settings.token.tokenUpdated'), type: AlertTypeEnum.Success, duration: 3000 }));
  };

  const copyToken = (): void => {
    navigator.clipboard.writeText(token ?? '');
    dispatch(addAlert({ message: t('settings.token.copied'), type: AlertTypeEnum.Success, duration: 3000 }));
  };

  return (
    <div className='token-settings'>
      <Typography variant='h6'>
        <Link href='https://app.theneo.io/bf08f5b1-1025-4a83-8518-14458df03592/pointauc/api-reference' target='_blank'>
          {t('settings.token.openDocs')}
        </Link>
      </Typography>
      <Button sx={{ width: 380 }} onClick={() => setOpened(true)} variant='outlined'>
        {t('settings.token.show')}
      </Button>
      <Dialog fullWidth maxWidth='md' open={opened} onClose={() => setOpened(false)}>
        <DialogContent>
          <Typography sx={{ marginBottom: 2 }} variant='h5' color='error'>
            {t('settings.token.dontShareToken')}
          </Typography>
          <Grid container spacing={2}>
            <Grid sx={{ flexGrow: 1 }}>
              <OutlinedInput type='password' value={token ?? ''} fullWidth />
            </Grid>
            <Grid>
              <Button onClick={copyToken} startIcon={<ContentCopyIcon />} variant='contained'>
                {t('settings.token.copy')}
              </Button>
            </Grid>
            <Grid>
              <LoadingButton onClick={resetToken} isLoading={loading} variant='outlined'>
                {t('settings.token.update')}
              </LoadingButton>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenSettings;
