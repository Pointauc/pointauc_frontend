import { lazy, Suspense, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Image, Overlay, ScrollArea } from '@mantine/core';
import classNames from 'classnames';
import { useHeadroom } from '@mantine/hooks';

import Notification from '@components/Notification/Notification';
import { RootState } from '@reducers';
import { updatePercents } from '@services/PercentsRefMap.ts';
import TrailersContainer from '@components/TrailersContainer/TrailersContainer';
import ChangelogModal from '@components/Changelog/ChangelogModal/ChangelogModal';
import { getCurrentLanguage } from '@constants/language.constants.ts';
import { Language } from '@enums/language.enum.ts';
import { calcBackgroundOpacity } from '@utils/ui/background.ts';
import { useIsMobile } from '@shared/lib/ui';
import { ScrollContextProvider, useScrollContext } from '@shared/lib/scroll';

import AucActions from './AucActions/AucActions';
import MobileActions from './AucActions/Mobile';
import ControlColumn from './ControlColumn/ControlColumn';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import styles from './AucPage.module.css';

import './AucPage.scss';

const LazyRules = lazy(() => import('./Rules/Rules.tsx'));

const AucPageContent: React.FC = () => {
  const { elementRef } = useScrollContext();
  const { background, backgroundOverlayOpacity, backgroundBlur } = useSelector(
    (root: RootState) => root.aucSettings.settings,
  );
  const isMobile = useIsMobile();
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const { slots, searchTerm } = useSelector((root: RootState) => root.slots);
  const { showRules } = useSelector((root: RootState) => root.aucSettings.view);

  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage(i18n);

  useEffect(() => {
    if (showChances && !searchTerm) {
      updatePercents(slots);
    }
  }, [searchTerm, showChances, slots]);

  const imageOpacity = useMemo(() => calcBackgroundOpacity(backgroundOverlayOpacity), [backgroundOverlayOpacity]);

  return (
    <Box className={classNames('auc-container', { 'custom-background': background })}>
      {background && (
        <Box className={styles.background}>
          <Image src={background} w='100%' h='100%' />
          <Overlay backgroundOpacity={imageOpacity} color='#242424' blur={backgroundBlur} />
        </Box>
      )}
      {currentLanguage.key !== Language.EN && <ChangelogModal />}
      <div className='auc-container-column'>
        <div className='auc-container-row'>
          <Box className='auc-container-left-column' visibleFrom='sm'>
            <Suspense fallback={<></>}>{showRules && <LazyRules />}</Suspense>
          </Box>
          <SlotsColumn />
          <ControlColumn />
        </div>
        {isMobile ? <MobileActions /> : <AucActions />}
      </div>
      <Notification />
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
