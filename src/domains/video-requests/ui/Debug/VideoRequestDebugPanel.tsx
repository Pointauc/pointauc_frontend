import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlay, IconSettings } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import { publishGlobalBid } from '@domains/bids/lib/globalBidsEventBus.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';

import type * as Integration from '@models/integration';

interface VideoRequestDebugConfig {
  requestContent: string;
  viewerName: string;
  integrationId: Integration.ID;
  cost: number;
  rewardId: string;
  randomizeOnSend: boolean;
}

const SAMPLE_REQUEST_CONTENTS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.twitch.tv/videos/1549263729?t=1h2m10s',
  'https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage-4j6rVj8vM4z8mK7v',
];

const SAMPLE_VIEWER_NAMES = ['debug_viewer', 'queue_tester', 'video_fan', 'local_repro'];

const getDefaultIntegrationId = (): Integration.ID => {
  const twitchIntegration = INTEGRATIONS.find((integration) => integration.id === 'twitch');

  return twitchIntegration?.id ?? INTEGRATIONS[0].id;
};

const createDefaultConfig = (): VideoRequestDebugConfig => ({
  requestContent: SAMPLE_REQUEST_CONTENTS[0],
  viewerName: SAMPLE_VIEWER_NAMES[0],
  integrationId: getDefaultIntegrationId(),
  cost: 1000,
  rewardId: 'debug-video-request',
  randomizeOnSend: false,
});

const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItem = <T,>(items: T[]): T => items[getRandomNumber(0, items.length - 1)];

const checkIsPointsIntegration = (integration: Integration.Config) => integration.type === 'points';

const VideoRequestDebugPanel = () => {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [config, setConfig] = useState<VideoRequestDebugConfig>(() => createDefaultConfig());

  const integrationOptions = useMemo(
    () =>
      INTEGRATIONS.map((integration) => ({
        value: integration.id,
        label: `${t(`integration.${integration.id}.name`)} - ${t(
          `videoRequests.debug.integrationTypes.${integration.type}`,
        )}`,
      })),
    [t],
  );

  const selectedIntegration =
    INTEGRATIONS.find((integration) => integration.id === config.integrationId) ?? INTEGRATIONS[0];
  const isPointsIntegration = checkIsPointsIntegration(selectedIntegration);

  const updateConfig = <TKey extends keyof VideoRequestDebugConfig>(
    key: TKey,
    value: VideoRequestDebugConfig[TKey],
  ) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      [key]: value,
    }));
  };

  const buildRandomizedConfig = (integrationId: Integration.ID): VideoRequestDebugConfig => {
    const selectedStaticIntegration =
      INTEGRATIONS.find((integration) => integration.id === integrationId) ?? INTEGRATIONS[0];
    const nextRewardId = checkIsPointsIntegration(selectedStaticIntegration)
      ? `debug-reward-${getRandomNumber(100, 999)}`
      : '';

    return {
      requestContent: getRandomItem(SAMPLE_REQUEST_CONTENTS),
      viewerName: getRandomItem(SAMPLE_VIEWER_NAMES),
      integrationId,
      cost: getRandomNumber(100, 5000),
      rewardId: nextRewardId,
      randomizeOnSend: config.randomizeOnSend,
    };
  };

  const handleSendRequest = async () => {
    const nextConfig = config.randomizeOnSend ? buildRandomizedConfig(config.integrationId) : config;

    if (!nextConfig.requestContent.trim() || !nextConfig.viewerName.trim()) {
      return;
    }

    const bid: Purchase = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      cost: nextConfig.cost,
      username: nextConfig.viewerName.trim(),
      message: nextConfig.requestContent.trim(),
      color: '#38bdf8',
      source: selectedIntegration.id,
      rewardId: isPointsIntegration ? nextConfig.rewardId.trim() || undefined : undefined,
      isDonation: !isPointsIntegration,
    };

    setIsSending(true);

    try {
      if (config.randomizeOnSend) {
        setConfig(nextConfig);
      }

      await publishGlobalBid(bid);
      notifications.show({
        color: 'green',
        message: t('videoRequests.debug.sentNotification'),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <section className='fixed top-4 left-4 z-[60]'>
        <Paper radius='md' shadow='xl' className='border border-slate-700 bg-slate-950/95 p-2 backdrop-blur'>
          <Group gap='xs' wrap='nowrap'>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              loading={isSending}
              size='sm'
              onClick={() => void handleSendRequest()}
            >
              {t('videoRequests.debug.send')}
            </Button>
            <Tooltip label={t('videoRequests.debug.openSettings')}>
              <ActionIcon
                size='lg'
                variant='light'
                color='gray'
                onClick={() => setIsSettingsOpen(true)}
                aria-label={t('videoRequests.debug.openSettings')}
              >
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>
      </section>

      <Modal
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t('videoRequests.debug.title')}
        centered
      >
        <Stack gap='md'>
          <Text size='sm' c='dimmed'>
            {t('videoRequests.debug.description')}
          </Text>

          <Group justify='space-between' align='center'>
            <Badge color={isPointsIntegration ? 'blue' : 'green'} variant='light'>
              {t(`videoRequests.debug.integrationTypes.${selectedIntegration.type}`)}
            </Badge>
            <Switch
              checked={config.randomizeOnSend}
              onChange={(event) => updateConfig('randomizeOnSend', event.currentTarget.checked)}
              label={t('videoRequests.debug.randomize')}
            />
          </Group>

          <TextInput
            label={t('videoRequests.debug.fields.requestContent')}
            value={config.requestContent}
            onChange={(event) => updateConfig('requestContent', event.currentTarget.value)}
          />

          <TextInput
            label={t('videoRequests.debug.fields.viewerName')}
            value={config.viewerName}
            onChange={(event) => updateConfig('viewerName', event.currentTarget.value)}
          />

          <Select
            label={t('videoRequests.debug.fields.integration')}
            data={integrationOptions}
            value={config.integrationId}
            onChange={(value) => {
              if (!value) {
                return;
              }

              const nextIntegration = INTEGRATIONS.find((integration) => integration.id === value);

              updateConfig('integrationId', value as Integration.ID);

              if (nextIntegration && !checkIsPointsIntegration(nextIntegration)) {
                updateConfig('rewardId', '');
              }

              if (nextIntegration && checkIsPointsIntegration(nextIntegration) && !config.rewardId) {
                updateConfig('rewardId', 'debug-video-request');
              }
            }}
            allowDeselect={false}
          />

          <NumberInput
            label={t('videoRequests.debug.fields.cost')}
            min={1}
            value={config.cost}
            onChange={(value) => updateConfig('cost', Number(value) || 1)}
          />

          {isPointsIntegration && (
            <TextInput
              label={t('videoRequests.debug.fields.rewardId')}
              value={config.rewardId}
              onChange={(event) => updateConfig('rewardId', event.currentTarget.value)}
            />
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default VideoRequestDebugPanel;
