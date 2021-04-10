import React, { FC } from 'react';
import { Score } from '../../../models/statistic';
import './Scoreboard.scss';

interface UsersTopProps {
  scoreboard: Score[];
}

const Scoreboard: FC<UsersTopProps> = ({ scoreboard }) => {
  return (
    <div className="scoreboard">
      {scoreboard.map(({ title, score }) => (
        <div key={title}>{`${title} - ${score}`}</div>
      ))}
    </div>
  );
};

export default Scoreboard;
