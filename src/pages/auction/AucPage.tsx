import { Box, Image, Overlay, ScrollArea } from '@mantine/core';
import clsx from 'clsx';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import TrailersContainer from '@components/TrailersContainer/TrailersContainer';
import { RootState } from '@reducers';
import { revertLatestActionLogEntry } from '@reducers/ActionsLog/ActionsLog.ts';
import { updatePercents } from '@services/PercentsRefMap.ts';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
import { ScrollContextProvider } from '@shared/lib/ScrollContextProvider';
import { useScrollContext } from '@shared/lib/scrollContext';
import { useIsMobile } from '@shared/lib/ui';
import { calcBackgroundOpacity } from '@utils/ui/background.ts';

import AucActions from './AucActions/AucActions';
import MobileActions from './AucActions/Mobile';
import styles from './AucPage.module.css';
import ControlColumn from './ControlColumn/ControlColumn';
import RulesSkeleton from './Rules/Skeleton';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import TotalAmount from './AucActions/TotalAmount/TotalAmount';

const LazyRules = lazy(() => import('@pages/auction/Rules/Rules.tsx'));
const ChangelogModal = lazy(() => import('@domains/changelog/ui/ChangelogModal'));

const AucPageContent: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { background, backgroundOverlayOpacity, backgroundBlur } = useSelector(
    (root: RootState) => root.aucSettings.settings,
  );
  const backgroundType = useSelector((root: RootState) => root.aucSettings.settings.backgroundType);
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
  const hasCustomBackground = backgroundType === 'customMedia' && Boolean(background);
  const hasGeometryBackground = backgroundType === 'geometry';
  const hasVisualBackground = hasCustomBackground || hasGeometryBackground;

  useAppHotkey(
    HOTKEY_ACTION_IDS.undoLatestAction,
    (event) => {
      event.preventDefault();
      dispatch(revertLatestActionLogEntry());
    },
    { preventDefault: true },
  );

  return (
    <Box className={clsx(styles.container, { 'custom-background': hasVisualBackground })}>
      {hasCustomBackground && (
        <Box className={styles.background}>
          <Image src={background} w='100%' h='100%' />
          <Overlay backgroundOpacity={imageOpacity} color='#242424' blur={backgroundBlur} />
        </Box>
      )}

      <TotalAmount />
      <Suspense fallback={null}>
        <ChangelogModal />
      </Suspense>
      <div className={styles.column}>
        <div className={styles.row}>
          <Box className={styles.leftColumn} visibleFrom='sm'>
            <Suspense fallback={<RulesSkeleton />}>{showRules && <LazyRules />}</Suspense>
          </Box>
          <SlotsColumn />
          <ControlColumn />
        </div>
        {isMobile && <MobileActions />}
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
