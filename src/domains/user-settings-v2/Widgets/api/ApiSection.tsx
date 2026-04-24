import { Anchor, Button, CopyButton, Modal, Text, TextInput, Title } from '@mantine/core';
import { IconCheck, IconCopy, IconKey } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { loadToken, updateToken } from '@api/tokenApi.ts';
import withLoading from '@decorators/withLoading.ts';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { RootState } from '@reducers';

const ApiSection = () => {
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
    <>
      <SettingsSection id='website-settings-api' title={t('settings.website.toc.api')} icon={<IconKey size={24} />}>
        <SettingsCard>
          <div className='flex flex-col gap-4 p-4'>
            <Anchor
              href='https://app.theneo.io/bf08f5b1-1025-4a83-8518-14458df03592/pointauc/api-reference'
              target='_blank'
            >
              {t('settings.token.openDocs')}
            </Anchor>

            <div className='flex flex-wrap items-center gap-2.5'>
              <Button disabled={!userId} onClick={() => setOpened(true)} variant='outline'>
                {t('settings.token.show')}
              </Button>
              {!userId && <Text c='dimmed'>{t('settings.token.userIdRequired')}</Text>}
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <Modal opened={opened} centered size='xl' title={t('settings.token.modalTitle')} onClose={() => setOpened(false)}>
        <div className='flex flex-col gap-4'>
          <Title order={4} c='red'>
            {t('settings.token.dontShareToken')}
          </Title>

          <div className='flex flex-wrap gap-2.5'>
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
            <Button onClick={() => void resetToken()} loading={loading} variant='outline'>
              {t('settings.token.update')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ApiSection;
