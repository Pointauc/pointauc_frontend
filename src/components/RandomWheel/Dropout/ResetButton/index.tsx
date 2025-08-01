import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { IconRefresh } from '@tabler/icons-react';
import { Group, Modal, Stack, Text } from '@mantine/core';
import { useState } from 'react';

interface ResetButtonProps {
  onClick: () => void;
}

const ResetButton = (props: ResetButtonProps) => {
  const { t } = useTranslation();
  const { onClick } = props;

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button
        className='wheel-controls-button'
        onClick={() => setOpened(true)}
        variant='contained'
        color='primary'
        endIcon={<IconRefresh size={18} style={{ marginBottom: 2 }} />}
      >
        {t('common.reset')}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('wheel.dropout.reset.modal.title')}
        centered
        size='sm'
      >
        <Stack gap='xs'>
          <Text>{t('wheel.dropout.reset.modal.description')}</Text>
          <Group justify='flex-end'>
            <Button onClick={() => setOpened(false)}>{t('common.cancel')}</Button>
            <Button onClick={onClick} variant='contained' color='primary'>
              {t('common.reset')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ResetButton;
