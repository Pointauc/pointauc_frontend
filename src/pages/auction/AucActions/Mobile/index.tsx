import { useState } from 'react';
import { ActionIcon, Box, Group, rem } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import IntegrationModal from './IntegrationModal/IntegrationModal';
import AddLotModal from './AddLotModal/AddLotModal';
import ClearAllModal from './ClearAllModal/ClearAllModal';
import styles from './Mobile.module.css';

const Mobile = () => {
  const { t } = useTranslation();
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [addLotModalOpen, setAddLotModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);

  return (
    <>
      <Box className={styles.mobileActionsContainer}>
        <Group gap='md' justify='center'>
          <ActionIcon variant='filled' size='xl' radius='xl' color='gray' onClick={() => setIntegrationModalOpen(true)}>
            <LinkIcon style={{ width: rem(24), height: rem(24) }} />
          </ActionIcon>

          <ActionIcon variant='filled' size={56} radius='xl' color='gray' onClick={() => setAddLotModalOpen(true)}>
            <AddIcon style={{ width: rem(32), height: rem(32) }} />
          </ActionIcon>

          <ActionIcon variant='filled' size='xl' radius='xl' color='gray' onClick={() => setClearAllModalOpen(true)}>
            <DeleteSweepIcon style={{ width: rem(24), height: rem(24) }} />
          </ActionIcon>
        </Group>
      </Box>

      <IntegrationModal opened={integrationModalOpen} onClose={() => setIntegrationModalOpen(false)} />

      <AddLotModal opened={addLotModalOpen} onClose={() => setAddLotModalOpen(false)} />

      <ClearAllModal opened={clearAllModalOpen} onClose={() => setClearAllModalOpen(false)} />
    </>
  );
};

export default Mobile;
