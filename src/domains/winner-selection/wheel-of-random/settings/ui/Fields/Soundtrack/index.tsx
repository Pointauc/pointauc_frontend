import { useState } from 'react';
import { ActionIcon, Indicator, Tooltip } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SoundtrackModal from './SoundtrackModal';

/**
 * Button to open soundtrack configuration modal
 * Shows indicator when soundtrack is configured
 */
const WheelSoundtrackField = () => {
  const { t } = useTranslation();
  const [modalOpened, setModalOpened] = useState(false);
  const { control } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const soundtrack = useWatch({ name: 'soundtrack', control });

  const isWheelSpinning = isSubmitting;

  const hasSoundtrack = soundtrack?.enabled && soundtrack?.source;

  return (
    <>
      <Indicator
        disabled={!hasSoundtrack}
        color={isWheelSpinning ? 'green' : 'blue'}
        size={12}
        offset={2}
        processing={isWheelSpinning}
      >
        <Tooltip label={t('wheel.soundtrack.configure')}>
          <ActionIcon size='xl' radius='md' variant='outline' onClick={() => setModalOpened(true)}>
            <IconMusic size={28} />
          </ActionIcon>
        </Tooltip>
      </Indicator>

      <SoundtrackModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
};

export default WheelSoundtrackField;
