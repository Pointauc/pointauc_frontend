import { Box, Button, Modal, Stack, Text, Title } from '@mantine/core';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';

import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  opened: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ opened, onClose, onContinue }) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='xl'
      centered
      withCloseButton
      title={
        <Title order={2} className={styles.title}>
          {t('overlays.welcome.title')}
        </Title>
      }
    >
      <Stack gap='lg'>
        <Box className={styles.gifContainer}>
          <img src={overlayDemoGif} alt={t('overlays.welcome.demoAlt')} className={styles.demoGif} />
        </Box>

        <Stack gap='md'>
          <Text size='md'>{t('overlays.welcome.description')}</Text>

          <Stack gap='xs'>
            <Text size='sm' fw={500}>
              {t('overlays.welcome.benefitsTitle')}
            </Text>
            <Text size='sm' c='dimmed'>
              <Trans i18nKey='overlays.welcome.benefit1' components={{ b: <b /> }} />
            </Text>
            <Text size='sm' c='dimmed'>
              <Trans i18nKey='overlays.welcome.benefit2' components={{ b: <b /> }} />
            </Text>
          </Stack>
        </Stack>

        <Button onClick={onContinue} size='md' fullWidth>
          {t('overlays.welcome.continue')}
        </Button>
      </Stack>
    </Modal>
  );
};

export default WelcomeModal;
