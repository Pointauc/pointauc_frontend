import { Box, Group, Stack, TableOfContents, Text } from '@mantine/core';
import { IconClockHour4, IconPalette, IconSparkles } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@domains/user-settings-v2/pages/WebsiteSettings.module.css';

interface SettingsTableOfContentsProps {
  contentId: string;
  contentRef: RefObject<HTMLDivElement | null>;
}

const tocIcons: Record<string, ReactNode> = {
  'website-settings-timer': <IconClockHour4 size={18} stroke={2} />,
  'website-settings-appearance': <IconPalette size={18} stroke={2} />,
  'website-settings-extra-modes': <IconSparkles size={18} stroke={2} />,
};

const SettingsTableOfContents = ({ contentId, contentRef }: SettingsTableOfContentsProps) => {
  const { t, i18n } = useTranslation();
  const tocReinitializeRef = useRef<() => void>(() => {});
  const [scrollHost, setScrollHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollHost(contentRef.current);
  }, [contentRef]);

  useEffect(() => {
    tocReinitializeRef.current();
  }, [i18n.language, scrollHost]);

  const sectionLabelMap = useMemo<Record<string, string>>(
    () => ({
      'website-settings-timer': t('settings.website.toc.timer'),
      'website-settings-appearance': t('settings.website.toc.appearance'),
      'website-settings-extra-modes': t('settings.website.toc.extraModes'),
    }),
    [t],
  );

  const placeholderStyle = {
    color: 'var(--mantine-color-dimmed)',
    opacity: 0.58,
    pointerEvents: 'none' as const,
  };

  return (
    <Stack gap='sm'>
      <Box component='nav' aria-label={t('settings.website.toc.label')}>
        <Stack gap={4}>
          <Text size='sm' fw={700} tt='uppercase' c='dimmed'>
            {t('settings.website.toc.website')}
          </Text>
          <TableOfContents
            color='blue'
            variant='none'
            classNames={{
              control: styles.tocControl,
            }}
            reinitializeRef={tocReinitializeRef}
            scrollSpyOptions={{
              selector: `#${contentId} :is(h2)`,
              scrollHost: scrollHost ?? undefined,
              offset: 24,
              getValue: (element) => sectionLabelMap[element.id] ?? element.textContent ?? '',
            }}
            size='md'
            getControlProps={({ active, data }) => ({
              onClick: () => data.getNode().scrollIntoView({ behavior: 'smooth', block: 'start' }),
              children: (
                <Group gap='xs' wrap='nowrap' miw={0} style={{ width: '100%' }}>
                  <Box className={styles.tocIcon}>{data.id ? tocIcons[data.id] ?? null : null}</Box>
                  <Text className={styles.tocLabel} size='md' fw={500} truncate>
                    {data.value}
                  </Text>
                </Group>
              ),
              'data-active': active || undefined,
            })}
          />
        </Stack>
      </Box>

      <Box>
        <Stack gap={4}>
          <Text size='sm' fw={700} tt='uppercase' c='dimmed'>
            {t('settings.website.toc.integrations')}
          </Text>
          <Text size='sm' fw={500} style={placeholderStyle}>
            {t('settings.website.toc.bidsGeneral')}
          </Text>
          <Text size='sm' fw={500} style={placeholderStyle}>
            {t('settings.website.toc.channelPoints')}
          </Text>
          <Text size='sm' fw={500} style={placeholderStyle}>
            {t('settings.website.toc.donations')}
          </Text>
        </Stack>
      </Box>

      <Box>
        <Stack gap={4}>
          <Text size='sm' fw={700} tt='uppercase' c='dimmed'>
            {t('settings.website.toc.other')}
          </Text>
          <Text size='sm' fw={500} style={placeholderStyle}>
            {t('settings.website.toc.api')}
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SettingsTableOfContents;
