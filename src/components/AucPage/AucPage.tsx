import React from 'react';
import { useSelector } from 'react-redux';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';
import { RootState } from '../../reducers';
import PageContainer from '../PageContainer/PageContainer';

const AucPage: React.FC = () => {
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

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
