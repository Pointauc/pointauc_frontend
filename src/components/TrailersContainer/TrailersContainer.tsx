import { FC } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

import TrailerWindow from './TrailerWindow/TrailerWindow';
import classes from './TrailersContainer.module.css';

const TrailersContainer: FC = () => {
  const { trailers } = useSelector((root: RootState) => root.extraWindows);
  return (
    <div className={classes.trailersContainer}>
      {trailers.map((trailer) => (
        <TrailerWindow {...trailer} key={trailer.id} />
      ))}
    </div>
  );
};

export default TrailersContainer;
