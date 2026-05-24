import { Loader, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconBrandTwitch, IconBrandYoutube, IconLinkPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';

import { VideoRequest } from '@domains/video-requests/model/types';
import IntegrationListenerControls from '@domains/video-requests/ui/Controls/IntegrationListenerControls';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import { getVideoRequestTitle } from '@domains/video-requests/ui/lib/videoRequestUiFormatters';

interface VideoRequestPlayerProps {
  request: VideoRequest | null;
  isAutoplayEnabled: boolean;
  listener: ReturnType<typeof useVideoRequestListener>;
  onEnded: () => void;
}

const VideoRequestPlayer = ({
  request,
  isAutoplayEnabled,
  listener,
  onEnded,
}: VideoRequestPlayerProps) => {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);
  const embedUrl = request?.parsedVideoReference.embedUrl;

  if (!request) {
    return (
      <section className='flex h-full min-h-[28rem] items-center justify-center rounded-md border border-paper-800 bg-paper-950 p-6'>
        <div className='grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_24rem]'>
          <div className='flex min-h-80 flex-col justify-between rounded-md border border-paper-700 bg-paper-800 p-6 elevated-2'>
            <div>
              <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary-light text-primary'>
                <IconLinkPlus size={26} />
              </div>
              <Text fw={800} size='2rem' className='text-paper-50'>
                {t('videoRequests.player.emptyTitle')}
              </Text>
              <Text size='md' className='mt-2 max-w-2xl text-dimmed'>
                {t('videoRequests.player.emptyDescription')}
              </Text>
            </div>

            <div className='mt-8 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-md border border-paper-800 bg-paper-950 p-3'>
                <IconBrandYoutube size={22} className='mb-2 text-red-400' />
                <Text fw={650} size='sm' className='text-paper-50'>
                  {t('videoRequests.player.services.youtube')}
                </Text>
              </div>
              <div className='rounded-md border border-paper-800 bg-paper-950 p-3'>
                <IconBrandTwitch size={22} className='mb-2 text-violet-300' />
                <Text fw={650} size='sm' className='text-paper-50'>
                  {t('videoRequests.player.services.twitch')}
                </Text>
              </div>
            </div>
          </div>

          <IntegrationListenerControls listener={listener} />
        </div>
      </section>
    );
  }

  if (!embedUrl) {
    return (
      <section className='flex h-full min-h-[28rem] items-center justify-center rounded-md border border-paper-800 bg-paper-950 p-6 text-center'>
        <Stack align='center'>
          <IconAlertCircle className='text-amber-300' size={36} />
          <Text fw={650} className='text-paper-50'>
            {t('videoRequests.player.noEmbed')}
          </Text>
        </Stack>
      </section>
    );
  }

  return (
    <section className='relative h-full min-h-[28rem] overflow-hidden rounded-md border border-paper-800 bg-black'>
      {hasError && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-6 text-center'>
          <Stack align='center'>
            <IconAlertCircle className='text-red-300' size={40} />
            <Text fw={700} className='text-paper-50'>
              {t('videoRequests.player.errorTitle')}
            </Text>
            <Text size='sm' className='max-w-md text-dimmed'>
              {t('videoRequests.player.errorDescription')}
            </Text>
          </Stack>
        </div>
      )}

      {request.sourceId === 'youtube' ? (
        <ReactPlayer
          key={request.id}
          src={request.metadata.canonicalUrl}
          controls
          playing={isAutoplayEnabled}
          width='100%'
          height='100%'
          fallback={
            <div className='flex h-full items-center justify-center'>
              <Loader color='cyan' />
            </div>
          }
          onEnded={onEnded}
          onError={() => setHasError(true)}
          onReady={() => setHasError(false)}
        />
      ) : (
        <iframe
          key={request.id}
          title={getVideoRequestTitle(request.metadata)}
          src={embedUrl}
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
          className='h-full w-full border-0'
          onLoad={() => setHasError(false)}
        />
      )}
    </section>
  );
};

export default VideoRequestPlayer;
