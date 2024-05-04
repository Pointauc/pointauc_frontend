import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './AuthorContacts.scss';
import TelegramIcon from '@mui/icons-material/Telegram';

import { Boosty } from '@components/Icons/Icons.tsx';

const AuthorContacts = () => {
  const { t } = useTranslation();

  return (
    <Grid container direction='column' className='author-contacts' gap={3}>
      <Grid container item gap={1}>
        <Typography variant='h6'>{t('author.contacts')}</Typography>
        <Grid wrap='nowrap' container item gap={1} alignItems='center' className='contact'>
          <TelegramIcon className='icon' />
          <a href='https://t.me/kozjarych' rel='noreferrer' target='_blank'>
            @kozjarych
          </a>
        </Grid>
      </Grid>
      <Grid container item gap={1}>
        <Typography variant='h6'>{t('author.support')}</Typography>
        <Grid container wrap='nowrap' item gap={1} alignItems='center' className='contact'>
          <Boosty className='boosty-icon icon' />
          <a href='https://boosty.to/kozjar/donate' rel='noreferrer' target='_blank'>
            boosty/kozjar
          </a>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AuthorContacts;
