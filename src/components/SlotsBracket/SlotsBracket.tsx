import { FC, memo } from 'react';

import Bracket from '@components/Bracket/components/Bracket';
import { Game, ID } from '@components/Bracket/components/model';

export interface SlotsBracketProps {
  currentGame: ID;
  rootGame: Game;
}

const SlotsBracket: FC<SlotsBracketProps> = ({ currentGame, rootGame }) => {
  return <Bracket rootGame={rootGame} currentGame={currentGame} />;
};

const SlotsBracketMemorized = memo(SlotsBracket);

export default SlotsBracketMemorized;
