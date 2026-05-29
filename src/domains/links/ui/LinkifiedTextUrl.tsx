import { ActionIcon, Anchor, Group, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { checkShouldShowExternalLinkConfirmation } from '@domains/links/lib/url';
import openExternalRedirectConfirmationModal from '@domains/links/ui/ExternalRedirectConfirmationModal';

interface LinkifiedTextUrlProps {
  href: string;
  content: string;
  copyable?: boolean;
  linkProps?: Record<string, any>;
}

const LinkifiedTextUrl = ({ href, content, copyable = false, linkProps = {} }: LinkifiedTextUrlProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const handleCopy = () => {
    navigator.clipboard.writeText(href);
  };

  const handleLinkClick = (event: React.MouseEvent) => {
    const shouldShowExternalLinkConfirmation = checkShouldShowExternalLinkConfirmation({
      url: href,
    });

    if (shouldShowExternalLinkConfirmation) {
      event.preventDefault();
      openExternalRedirectConfirmationModal({
        href,
        onConfirm: () => window.open(href, '_blank'),
      });
    }
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
    </>
  );
};

export default LinkifiedTextUrl;
