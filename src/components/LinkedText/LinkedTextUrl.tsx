import React from 'react';
import { IconButton, Link, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { addAlert } from '@reducers/notifications/notifications';
import { AlertTypeEnum } from '@models/alert.model.ts';

interface LinkedTextUrlProps {
  href: string;
  content: string;
  copyable?: boolean;
  linkProps?: Record<string, any>;
}

const LinkedTextUrl = ({ href, content, copyable = false, linkProps = {} }: LinkedTextUrlProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(href)
      .then(() => {
        dispatch(
          addAlert({
            type: AlertTypeEnum.Info,
            message: t('common.linkCopied'),
          }),
        );
      })
      .catch(() => {
        dispatch(
          addAlert({
            type: AlertTypeEnum.Error,
            message: t('common.copyFailed'),
          }),
        );
      });
  };

  return (
    <Stack direction='row' alignItems='center' spacing={0.5} component='span'>
      {copyable && (
        <Tooltip title={t('common.copyLink')}>
          <IconButton size='medium' onClick={handleCopy}>
            <ContentCopyIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      )}
      <Link href={href} {...linkProps}>
        {content}
      </Link>
    </Stack>
  );
};

export default LinkedTextUrl;
