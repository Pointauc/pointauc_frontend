import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useScrollSpy } from '@mantine/hooks';
import { IconArticle, IconClockHour4, IconCoin, IconKey, IconPalette, IconSparkles } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import PointsIcon from '@assets/icons/channelPoints.svg?react';
import styles from '@domains/user-settings-v2/pages/WebsiteSettings.module.css';

interface SettingsTableOfContentsProps {
  contentId: string;
  contentRef: RefObject<HTMLDivElement | null>;
}

interface SettingsTableOfContentsLink {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SettingsTableOfContentsArea {
  title: string;
  links: SettingsTableOfContentsLink[];
}

const ACTIVE_SECTION_OFFSET = 24;

const SettingsTableOfContents = ({ contentId, contentRef }: SettingsTableOfContentsProps) => {
  const { t } = useTranslation();
  const [scrollHost, setScrollHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollHost(contentRef.current);
  }, [contentRef]);

  const tocAreas = useMemo<SettingsTableOfContentsArea[]>(
    () => [
      {
        title: t('settings.website.toc.website'),
        links: [
          {
            id: 'website-settings-timer',
            label: t('settings.website.toc.timer'),
            icon: <IconClockHour4 size={18} stroke={2} />,
          },
          {
            id: 'website-settings-appearance',
            label: t('settings.website.toc.appearance'),
            icon: <IconPalette size={18} stroke={2} />,
          },
        ],
      },
      {
        title: t('settings.website.toc.integrations'),
        links: [
          {
            id: 'website-settings-bids-general',
            label: t('settings.website.toc.bidsGeneral'),
            icon: <IconArticle size={18} stroke={2} />,
          },
          {
            id: 'website-settings-channel-points',
            label: t('settings.website.toc.channelPoints'),
            icon: <PointsIcon width={18} height={18} />,
          },
          {
            id: 'website-settings-donations',
            label: t('settings.website.toc.donations'),
            icon: <IconCoin size={18} stroke={2} />,
          },
        ],
      },
      {
        title: t('settings.website.toc.other'),
        links: [
          {
            id: 'website-settings-extra-modes',
            label: t('settings.website.toc.extraModes'),
            icon: <IconSparkles size={18} stroke={2} />,
          },
          {
            id: 'website-settings-api',
            label: t('settings.website.toc.api'),
            icon: <IconKey size={18} stroke={2} />,
          },
        ],
      },
    ],
    [t],
  );

  const tocLinks = useMemo(() => tocAreas.flatMap((area) => area.links), [tocAreas]);
  const tocLinkSelector = useMemo(() => tocLinks.map(({ id }) => `#${id}`).join(', '), [tocLinks]);
  const tocLinkLabelMap = useMemo(() => Object.fromEntries(tocLinks.map((link) => [link.id, link.label])), [tocLinks]);

  const { active, data, reinitialize } = useScrollSpy({
    selector: `#${contentId} :is(${tocLinkSelector})`,
    scrollHost: scrollHost ?? undefined,
    offset: ACTIVE_SECTION_OFFSET,
    getDepth: () => 1,
    getValue: (element) => tocLinkLabelMap[element.id] ?? element.textContent ?? '',
  });

  const activeSectionId = data[active]?.id ?? null;

  useEffect(() => {
    if (scrollHost) {
      reinitialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollHost, tocLinkSelector]);

  const scrollToSection = (sectionId: string) => {
    const section = data.find((heading) => heading.id === sectionId);

    section?.getNode().scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box component='nav' aria-label={t('settings.website.toc.label')} id={`${contentId}-toc`}>
      <Stack gap='sm'>
        {tocAreas.map((area) => (
          <Stack key={area.title} gap={4}>
            <Text size='sm' fw={700} tt='uppercase' c='dimmed'>
              {area.title}
            </Text>

            {area.links.map((link) => {
              const isActive = activeSectionId === link.id;

              return (
                <UnstyledButton
                  key={link.id}
                  type='button'
                  className={styles.tocControl}
                  aria-current={isActive ? 'location' : undefined}
                  data-active={isActive || undefined}
                  onClick={() => scrollToSection(link.id)}
                >
                  <Group gap='xs' wrap='nowrap' miw={0} style={{ width: '100%' }}>
                    <Box className={styles.tocIcon}>{link.icon}</Box>
                    <Text className={styles.tocLabel} size='sm' fw={500} truncate>
                      {link.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default SettingsTableOfContents;
