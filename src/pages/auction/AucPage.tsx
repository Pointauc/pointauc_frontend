import { lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Notification from '@components/Notification/Notification';
import { RootState } from '@reducers';
import PageContainer from '@components/PageContainer/PageContainer';
import { updatePercents } from '@services/PercentsRefMap.ts';
import TrailersContainer from '@components/TrailersContainer/TrailersContainer';
import ChangelogModal from '@components/Changelog/ChangelogModal/ChangelogModal';

import AucActions from './AucActions/AucActions';
import ControlColumn from './ControlColumn/ControlColumn';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import './AucPage.scss';

const LazyRules = lazy(() => import('./Rules/Rules.tsx'));

const AucPage: React.FC = () => {
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const { slots, searchTerm } = useSelector((root: RootState) => root.slots);
  const { showRules } = useSelector((root: RootState) => root.aucSettings.view);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  useEffect(() => {
    if (showChances && !searchTerm) {
      updatePercents(slots);
    }
  }, [searchTerm, showChances, slots]);

  return (
    <PageContainer className='auc-container' style={backgroundStyles} maxWidth={false}>
      <ChangelogModal />
      <div className='auc-container-column'>
        <div className='auc-container-row'>
          <Suspense fallback={<></>}>{showRules && <LazyRules />}</Suspense>
          <SlotsColumn />
          <ControlColumn />
        </div>
        <AucActions />
      </div>
      <Notification />
      <TrailersContainer />
    </PageContainer>
  );
};

export default AucPage;
