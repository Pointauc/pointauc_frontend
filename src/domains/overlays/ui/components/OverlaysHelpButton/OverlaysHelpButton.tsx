import { ActionIcon, Tooltip } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './OverlaysHelpButton.module.css';

interface OverlaysHelpButtonProps {
  onClick: () => void;
}

const OverlaysHelpButton: FC<OverlaysHelpButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Tooltip label={t('overlays.instructions.helpButtonTooltip')} position='bottom'>
      <ActionIcon variant='subtle' size='lg' onClick={onClick} className={styles.helpButton} aria-label={t('overlays.instructions.helpButtonTooltip')}>
        <IconHelp size={20} />
      </ActionIcon>
    </Tooltip>
  );
};

export default OverlaysHelpButton;

