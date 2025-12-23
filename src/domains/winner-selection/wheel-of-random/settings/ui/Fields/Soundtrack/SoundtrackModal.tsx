import { FC, useCallback } from 'react';
import { Modal, Stack, Text, Alert } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import InfoIcon from '@mui/icons-material/Info';

import { DEFAULT_SOUNDTRACK_CONFIG } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/constants';
import { useLocalStorageState } from '@shared/lib/localState/useLocalStorageState';

import AudioSourceSelector from './AudioSourceSelector';
import SoundtrackSourceConfig from './SoundtrackSourceConfig';
import classes from './SoundtrackModal.module.css';

interface SoundtrackModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Main modal for configuring wheel soundtrack
 * Allows users to select audio source, adjust timing, and test playback
 */
const SoundtrackModal: FC<SoundtrackModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation();
  const { setValue, getValues, control } = useFormContext<Wheel.Settings>();
  const [hasShownHint, setHasShownHint] = useLocalStorageState<boolean>('wheelSoundtrackHintShown', false);

  // Watch current form values
  const source = useWatch({ name: 'soundtrack.source', control }) || DEFAULT_SOUNDTRACK_CONFIG.source;

  const handleSourceSelect = useCallback(
    (source: Wheel.SoundtrackSource) => {
      const values = getValues().soundtrack ?? DEFAULT_SOUNDTRACK_CONFIG;
      setValue('soundtrack', {
        ...values,
        enabled: true,
        source,
        offset: 0,
        waveformData: undefined,
      });
    },
    [getValues, setValue],
  );

  return (
    <Modal opened={opened} onClose={onClose} title={t('wheel.soundtrack.title')} size='xl' centered padding='lg'>
      <Stack gap='md' className={classes.modalContent}>
        {!hasShownHint && (
          <Alert
            icon={<InfoIcon />}
            color='blue'
            className={classes.infoBanner}
            onClose={() => setHasShownHint(true)}
            withCloseButton
          >
            <Text size='sm'>{t('wheel.soundtrack.description')}</Text>
          </Alert>
        )}

        {!source && <AudioSourceSelector onSourceSelect={handleSourceSelect} />}

        {source && <SoundtrackSourceConfig />}
      </Stack>
    </Modal>
  );
};

export default SoundtrackModal;
