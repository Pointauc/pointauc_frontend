import { Anchor, Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconArrowRight, IconBrandWindows, IconDownload, IconExternalLink, IconPackage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import useDesktopDownloadUrls from '@domains/desktop/lib/useDesktopDownloadUrls';

export const DesktopDownloadModalContent = () => {
  const { t } = useTranslation();
  const { installerUrl, portableUrl, releasesPageUrl } = useDesktopDownloadUrls();

  return (
    <Stack gap='lg' className='pt-1'>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
        {/* Option 1: Installer Card (Blue) */}
        <a
          href={installerUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-950/15 via-neutral-900/90 to-neutral-900/95 p-5 text-inherit no-underline transition-all duration-300 hover:border-blue-500/50 hover:from-blue-950/30 hover:shadow-lg hover:shadow-blue-950/30 cursor-pointer before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-xl before:bg-gradient-to-r before:from-transparent before:via-blue-500/40 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300'
        >
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-200 group-hover:scale-105 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white'>
                <IconDownload size={22} />
              </div>
              <Badge size='sm' variant='light' color='blue'>
                {t('desktop.downloadModal.installer.badge')}
              </Badge>
            </div>

            <div>
              <div className='flex items-baseline gap-1.5'>
                <Text fw={700} size='md' className='text-white'>
                  {t('desktop.downloadModal.installer.title')}
                </Text>
                <Text size='xs' c='dimmed' fw={600}>
                  {t('desktop.downloadModal.installer.format')}
                </Text>
              </div>
              <Text size='xs' c='dimmed' className='mt-1 leading-relaxed'>
                {t('desktop.downloadModal.installer.description')}
              </Text>
            </div>
          </div>

          <div className='mt-5 flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors duration-200 group-hover:text-blue-300'>
            <span>{t('desktop.downloadModal.installer.action')}</span>
            <IconArrowRight size={14} className='transition-transform duration-200 group-hover:translate-x-1.5' />
          </div>
        </a>

        {/* Option 2: Portable Card (Violet) */}
        <a
          href={portableUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/15 via-neutral-900/90 to-neutral-900/95 p-5 text-inherit no-underline transition-all duration-300 hover:border-purple-500/50 hover:from-purple-950/30 hover:shadow-lg hover:shadow-purple-950/30 cursor-pointer before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-xl before:bg-gradient-to-r before:from-transparent before:via-purple-500/40 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300'
        >
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 transition-all duration-200 group-hover:scale-105 group-hover:border-purple-500 group-hover:bg-purple-500 group-hover:text-white'>
                <IconPackage size={22} />
              </div>
              <Badge size='sm' variant='light' color='violet'>
                {t('desktop.downloadModal.portable.badge')}
              </Badge>
            </div>

            <div>
              <div className='flex items-baseline gap-1.5'>
                <Text fw={700} size='md' className='text-white'>
                  {t('desktop.downloadModal.portable.title')}
                </Text>
                <Text size='xs' c='dimmed' fw={600}>
                  {t('desktop.downloadModal.portable.format')}
                </Text>
              </div>
              <Text size='xs' c='dimmed' className='mt-1 leading-relaxed'>
                {t('desktop.downloadModal.portable.description')}
              </Text>
            </div>
          </div>

          <div className='mt-5 flex items-center gap-1.5 text-xs font-semibold text-purple-400 transition-colors duration-200 group-hover:text-purple-300'>
            <span>{t('desktop.downloadModal.portable.action')}</span>
            <IconArrowRight size={14} className='transition-transform duration-200 group-hover:translate-x-1.5' />
          </div>
        </a>
      </SimpleGrid>

      <Group justify='space-between' align='center' pt='xs' className='border-t border-neutral-800/80'>
        <Group gap={6}>
          <IconBrandWindows size={14} className='text-neutral-500' />
          <Text size='xs' c='dimmed'>
            {t('desktop.downloadModal.systemRequirements')}
          </Text>
        </Group>

        <Anchor
          href={releasesPageUrl}
          target='_blank'
          rel='noopener noreferrer'
          size='xs'
          c='dimmed'
          className='flex items-center gap-1 hover:underline'
        >
          {t('desktop.downloadModal.viewAllReleases')}
          <IconExternalLink size={12} />
        </Anchor>
      </Group>
    </Stack>
  );
};

export default DesktopDownloadModalContent;
