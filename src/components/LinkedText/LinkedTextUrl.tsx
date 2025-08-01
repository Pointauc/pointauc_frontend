import React, { useState } from 'react';
import { ActionIcon, Anchor, Group, Modal, Text, Button, Stack, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { addAlert } from '@reducers/notifications/notifications';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { ALLOWED_SAFE_DOMAINS } from '@constants/common.constants.ts';

interface LinkedTextUrlProps {
  href: string;
  content: string;
  copyable?: boolean;
  linkProps?: Record<string, any>;
}

const LinkedTextUrl = ({ href, content, copyable = false, linkProps = {} }: LinkedTextUrlProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const isUrlSafe = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      return ALLOWED_SAFE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  };

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

  const handleLinkClick = (e: React.MouseEvent) => {
    if (!isUrlSafe(href)) {
      e.preventDefault();
      setShowWarningModal(true);
    }
  };

  const handleConfirmNavigation = () => {
    setShowWarningModal(false);
    window.open(href, '_blank');
  };

  return (
    <>
      <Group gap='xs' wrap='nowrap' component='span'>
        {copyable && (
          <Tooltip label={t('common.copyLink')}>
            <ActionIcon size='lg' variant='subtle' c='white' onClick={handleCopy}>
              <ContentCopyIcon fontSize='large' />
            </ActionIcon>
          </Tooltip>
        )}
        <Anchor fz={32} href={href} onClick={handleLinkClick} {...linkProps}>
          {content}
        </Anchor>
      </Group>

      <Modal
        opened={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title={t('common.externalLinkWarning')}
        centered
        size='lg'
      >
        <Stack gap='md'>
          <Text>{t('common.externalLinkDisclaimer')}</Text>
          <Text fw={500} c='orange'>
            {href}
          </Text>
          <Group justify='flex-end' gap='sm'>
            <Button variant='outline' onClick={() => setShowWarningModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button color='orange' onClick={handleConfirmNavigation} leftSection={<OpenInNewIcon fontSize='small' />}>
              {t('common.openLink')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default LinkedTextUrl;
