import { Box, Image, Overlay, ScrollArea, Skeleton, Stack } from '@mantine/core';
import clsx from 'clsx';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import TrailersContainer from '@components/TrailersContainer/TrailersContainer';
import { RootState } from '@reducers';
import { updatePercents } from '@services/PercentsRefMap.ts';
import { ScrollContextProvider, useScrollContext } from '@shared/lib/scroll';
import { useIsMobile } from '@shared/lib/ui';
import { calcBackgroundOpacity } from '@utils/ui/background.ts';

import AucActions from './AucActions/AucActions';
import MobileActions from './AucActions/Mobile';
import styles from './AucPage.module.css';
import ControlColumn from './ControlColumn/ControlColumn';
import SlotsColumn from './SlotsColumn/SlotsColumn';

const LazyRules = lazy(() => import('@pages/auction/Rules/Rules.tsx'));
const ChangelogModal = lazy(() => import('@domains/changelog/ui/ChangelogModal'));

const RulesSkeleton: React.FC = () => (
  <Stack gap='sm' w={370}>
    <Skeleton height={200} radius='sm' />
    <Skeleton height={40} radius='sm' />
    <Skeleton height={80} radius='sm' />
  </Stack>
);

const AucPageContent: React.FC = () => {
  const { background, backgroundOverlayOpacity, backgroundBlur } = useSelector(
    (root: RootState) => root.aucSettings.settings,
  );
  const isMobile = useIsMobile();
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const { slots, searchTerm } = useSelector((root: RootState) => root.slots);
  const { showRules } = useSelector((root: RootState) => root.aucSettings.view);

  useEffect(() => {
    if (showChances && !searchTerm) {
      updatePercents(slots);
    }
  }, [searchTerm, showChances, slots]);

  const imageOpacity = useMemo(() => calcBackgroundOpacity(backgroundOverlayOpacity), [backgroundOverlayOpacity]);

  return (
    <Box className={clsx(styles.container, { 'custom-background': background })}>
      {background && (
        <Box className={styles.background}>
          <Image src={background} w='100%' h='100%' />
          <Overlay backgroundOpacity={imageOpacity} color='#242424' blur={backgroundBlur} />
        </Box>
      )}
      <ChangelogModal />
      <div className={styles.column}>
        <div className={styles.row}>
          <Box className={styles.leftColumn} visibleFrom='sm'>
            <Suspense fallback={<RulesSkeleton />}>{showRules && <LazyRules />}</Suspense>
          </Box>
          <SlotsColumn />
          <ControlColumn />
        </div>
        {isMobile ? <MobileActions /> : <AucActions />}
      </div>
      <TrailersContainer />
    </Box>
  );
};

const AucPageContentMobile: React.FC = () => {
  const { elementRef } = useScrollContext();
  return (
    <ScrollArea scrollbarSize={4} type='always' viewportRef={elementRef}>
      <AucPageContent />
    </ScrollArea>
  );
};

const AucPage: React.FC = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <ScrollContextProvider>
        <AucPageContentMobile />
      </ScrollContextProvider>
    );
  }

  return <AucPageContent />;
};

export default AucPage;
