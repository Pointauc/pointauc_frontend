import { Tooltip } from '@mantine/core';
import { IconLink } from '@tabler/icons-react';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { checkShouldShowExternalLinkConfirmation } from '@domains/links/lib/url';
import openExternalRedirectConfirmationModal from '@domains/links/ui/ExternalRedirectConfirmationModal';

import styles from './LotControls.module.css';

interface LotLinkButtonProps {
  href: string;
  url: string;
}

const LotLinkButton = ({ href, url }: LotLinkButtonProps) => {
  const { t } = useTranslation();

  const handleOpenDetectedLink = useCallback(() => {
    const shouldShowExternalLinkConfirmation = checkShouldShowExternalLinkConfirmation({
      url: href,
    });

    if (shouldShowExternalLinkConfirmation) {
      openExternalRedirectConfirmationModal({
        href,
        onConfirm: () => window.open(href, '_blank'),
      });

      return;
    }

    window.open(href, '_blank');
  }, [href]);

  return (
    <>
      <Tooltip
        label={t('lot.openDetectedLink', { url })}
        withArrow
        offset={-10}
        openDelay={120}
        styles={{ tooltip: { maxWidth: 'none', whiteSpace: 'nowrap' } }}
      >
        <button
          type='button'
          onClick={handleOpenDetectedLink}
          className={clsx(styles.iconButton, styles.linkIconButton)}
          aria-label={t('common.openLink')}
        >
          <span className={styles.linkIconUnderline}>
            <IconLink size={20} />
          </span>
        </button>
      </Tooltip>
    </>
  );
};

export default LotLinkButton;
