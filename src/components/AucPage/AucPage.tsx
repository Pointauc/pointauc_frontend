import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';
import { RootState } from '../../reducers';
import PageContainer from '../PageContainer/PageContainer';
import { updatePercents } from '../../services/PercentsRefMap';

const AucPage: React.FC = () => {
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const { slots } = useSelector((root: RootState) => root.slots);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  useEffect(() => {
    if (showChances) {
      updatePercents(slots);
    }
  }, [showChances, slots]);

  return (
    <PageContainer className="auc-container" style={backgroundStyles} maxWidth={false}>
      <div className="auc-container-content">
        <SlotsColumn />
        <ControlColumn />
      </div>
      <Notification />
    </PageContainer>
  );
};

export default AucPage;
