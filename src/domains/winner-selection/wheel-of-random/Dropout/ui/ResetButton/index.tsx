import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { Group, Modal, Stack, Text } from '@mantine/core';
import { useState } from 'react';

interface ResetButtonProps extends ButtonProps {
  onClick: () => void;
}

const ResetButton = (props: ResetButtonProps) => {
  const { t } = useTranslation();
  const { onClick } = props;

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)} variant='filled' color='primary' rightSection={<IconRefresh size={18} />}>
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
            <Button onClick={() => setOpened(false)} variant='outline'>
              {t('common.cancel')}
            </Button>
            <Button onClick={onClick} variant='filled' color='primary'>
              {t('common.reset')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ResetButton;
