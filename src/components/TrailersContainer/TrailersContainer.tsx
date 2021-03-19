import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import TrailerWindow from './TrailerWindow/TrailerWindow';
import './TrailersContainer.scss';

const TrailersContainer: FC = () => {
  const { trailers } = useSelector((root: RootState) => root.extraWindows);
  return (
    <div className="trailers-container">
      {trailers.map((trailer) => (
        <TrailerWindow {...trailer} key={trailer.id} />
      ))}
    </div>
  );
};

export default TrailersContainer;
