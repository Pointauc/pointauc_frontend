import React from 'react';
import { useSelector } from 'react-redux';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';
import { RootState } from '../../reducers';
import PageContainer from '../PageContainer/PageContainer';

const AucPage: React.FC = () => {
  const { background, isDoubleAuc } = useSelector((root: RootState) => root.aucSettings.settings);
  const { slots } = useSelector((root: RootState) => root.slots);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <PageContainer className="auc-container" style={backgroundStyles} maxWidth={false}>
      <div className="auc-container-content">
        <div className="auc-container-content-slots">
          <SlotsColumn slots={slots[0]} index={0} />
          {isDoubleAuc && <SlotsColumn slots={slots[1]} index={1} />}
        </div>
        <ControlColumn />
      </div>
      <Notification />
    </PageContainer>
  );
};

export default AucPage;
