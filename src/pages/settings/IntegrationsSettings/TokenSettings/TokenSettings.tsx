import { Anchor, Button, CopyButton, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';

import { loadToken, updateToken } from '@api/tokenApi.ts';
import withLoading from '@decorators/withLoading.ts';
import { RootState } from '@reducers';

const TokenSettings = () => {
  const { t } = useTranslation();
  const { userId } = useSelector((root: RootState) => root.user);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadTokenData = async () => {
      setToken(await loadToken());
    };

    if (opened) {
      withLoading(setLoading, loadTokenData)();
    }
  }, [opened]);

  const resetToken = async (): Promise<void> => {
    await withLoading(setLoading, async () => setToken(await updateToken()))();
    notifications.show({
      message: t('settings.token.tokenUpdated'),
      color: 'green',
    });
  };

  return (
    <Stack align='flex-start'>
      <Text variant='h6'>
        <Anchor
          href='https://app.theneo.io/bf08f5b1-1025-4a83-8518-14458df03592/pointauc/api-reference'
          target='_blank'
        >
          {t('settings.token.openDocs')}
        </Anchor>
      </Text>
      <Button disabled={!userId} onClick={() => setOpened(true)} variant='outline'>
        {t('settings.token.show')}
      </Button>
      {!userId && <Text color='dimmed'>{t('settings.token.userIdRequired')}</Text>}
      <Modal opened={opened} centered size='xl' title={t('settings.token.modalTitle')} onClose={() => setOpened(false)}>
        <Stack gap='dm'>
          <Title order={4} c='red'>
            {t('settings.token.dontShareToken')}
          </Title>
          <Group gap='sm'>
            <TextInput type='password' value={token ?? ''} flex={1} readOnly />
            <CopyButton value={token ?? ''}>
              {({ copied, copy }) => (
                <Button
                  disabled={!token}
                  onClick={copy}
                  leftSection={copied ? <IconCheck /> : <IconCopy />}
                  color={copied ? 'green' : 'blue'}
                  variant='filled'
                >
                  {t(copied ? 'common.copied' : 'common.copy')}
                </Button>
              )}
            </CopyButton>
            <Button onClick={resetToken} loading={loading} variant='outline'>
              {t('settings.token.update')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default TokenSettings;
