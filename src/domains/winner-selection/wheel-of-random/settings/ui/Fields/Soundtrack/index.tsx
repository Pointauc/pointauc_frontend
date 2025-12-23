import { useState } from 'react';
import { ActionIcon, Indicator } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';

import SoundtrackModal from './SoundtrackModal';

/**
 * Button to open soundtrack configuration modal
 * Shows indicator when soundtrack is configured
 */
const WheelSoundtrackField = () => {
  const [modalOpened, setModalOpened] = useState(true);
  const { control } = useFormContext<Wheel.Settings>();
  const soundtrack = useWatch({ name: 'soundtrack', control });

  const hasSoundtrack = soundtrack?.enabled && soundtrack?.source;

  return (
    <>
      <Indicator disabled={!hasSoundtrack} color='blue' size={8}>
        <ActionIcon size='xl' radius='md' variant='outline' onClick={() => setModalOpened(true)}>
          <IconMusic size={28} />
        </ActionIcon>
      </Indicator>

      <SoundtrackModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
};

export default WheelSoundtrackField;
