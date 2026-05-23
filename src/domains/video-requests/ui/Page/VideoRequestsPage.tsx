import { Badge, Checkbox, Divider, Group, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useVideoRequestQueue, useVideoRequestRejections } from '@domains/video-requests/model/hooks';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';

const VideoRequestsPage = () => {
  const { t } = useTranslation();
  const listener = useVideoRequestListener();
  const queueQuery = useVideoRequestQueue();
  const rejectionsQuery = useVideoRequestRejections();

  const listeningSettings = listener.settings?.listening;

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-10 text-slate-50'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center'>
        <Paper
          radius='lg'
          shadow='xl'
          className='w-full max-w-2xl border border-slate-800 bg-slate-900/90 p-8'
        >
          <Stack gap='lg'>
            <Title order={1} className='text-3xl font-semibold text-slate-50'>
              {t('videoRequests.page.title')}
            </Title>
            <Text size='lg' c='dimmed'>
              {t('videoRequests.page.description')}
            </Text>
            <Divider className='border-slate-800' />
            <Group justify='space-between' align='center'>
              <div>
                <Text fw={600}>{t('videoRequests.listener.title')}</Text>
                <Text size='sm' c='dimmed'>
                  {t('videoRequests.listener.description')}
                </Text>
              </div>
              <Switch
                checked={Boolean(listeningSettings?.isEnabled)}
                disabled={listener.isLoading || listener.isSaving}
                onChange={(event) => void listener.setListeningEnabled(event.currentTarget.checked)}
                label={t('videoRequests.listener.enable')}
              />
            </Group>
            <Stack gap='xs'>
              <Text fw={600}>{t('videoRequests.listener.groupsTitle')}</Text>
              <Checkbox
                checked={Boolean(listeningSettings?.activeBidGroups.includes('donations'))}
                disabled={listener.isLoading || listener.isSaving}
                label={t('videoRequests.listener.groups.donations')}
                onChange={(event) => void listener.toggleBidGroup('donations', event.currentTarget.checked)}
              />
              <Checkbox
                checked={Boolean(listeningSettings?.activeBidGroups.includes('channelPoints'))}
                disabled={listener.isLoading || listener.isSaving}
                label={t('videoRequests.listener.groups.channelPoints')}
                onChange={(event) => void listener.toggleBidGroup('channelPoints', event.currentTarget.checked)}
              />
            </Stack>
            <Stack gap='sm'>
              <Text fw={600}>{t('videoRequests.listener.integrationsTitle')}</Text>
              {Object.entries(listener.availableIntegrationsByGroup).map(([group, groupIntegrations]) => (
                <Paper key={group} radius='md' className='border border-slate-800 bg-slate-950/70 p-4'>
                  <Stack gap='sm'>
                    <Group justify='space-between'>
                      <Text fw={500}>{t(`videoRequests.listener.groups.${group}`)}</Text>
                      <Badge variant='light' color='gray'>
                        {groupIntegrations.length}
                      </Badge>
                    </Group>
                    {groupIntegrations.length === 0 ? (
                      <Text size='sm' c='dimmed'>
                        {t('videoRequests.listener.noAuthenticatedIntegrations')}
                      </Text>
                    ) : (
                      groupIntegrations.map((integration) => {
                        const subscription = listener.subscriptions[integration.id];
                        const statusKey = subscription?.loading
                          ? 'loading'
                          : subscription?.subscribed
                            ? 'subscribed'
                            : 'idle';

                        return (
                          <Group key={integration.id} justify='space-between'>
                            <Text size='sm'>{t(`integration.${integration.id}.name`)}</Text>
                            <Badge
                              variant='light'
                              color={statusKey === 'subscribed' ? 'green' : statusKey === 'loading' ? 'yellow' : 'gray'}
                            >
                              {t(`videoRequests.listener.integrationStatus.${statusKey}`)}
                            </Badge>
                          </Group>
                        );
                      })
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
            <Group gap='sm'>
              <Badge variant='light' color='blue'>
                {t('videoRequests.listener.stats.queue', { count: queueQuery.data?.length ?? 0 })}
              </Badge>
              <Badge variant='light' color='red'>
                {t('videoRequests.listener.stats.rejections', { count: rejectionsQuery.data?.length ?? 0 })}
              </Badge>
            </Group>
          </Stack>
        </Paper>
      </div>
    </main>
  );
};

export default VideoRequestsPage;
