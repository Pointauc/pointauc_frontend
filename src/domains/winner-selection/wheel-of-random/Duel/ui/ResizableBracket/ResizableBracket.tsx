import { FC, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
// @ts-ignore
import { MapInteractionCSS } from 'react-map-interaction';
import { Button, Typography } from '@mui/material';

import { Point } from '@services/SpinPaceService.ts';
import { Game } from '@components/Bracket/components/model';
import Bracket from '@components/Bracket/components/Bracket.tsx';

interface ResizableBracket {
  currentGame?: Game | null;
  rootGame?: Game | null;
}

const ResizableBracket: FC<ResizableBracket> = ({ currentGame, rootGame }) => {
  const [isFullscreenBracket, setIsFullscreenBracket] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [translation, setTranslation] = useState<Point>({ x: 0, y: 0 });
  const bracketWrapper = useRef<HTMLDivElement>(null);

  const scrollToCurrentGame = useCallback(() => {
    if (currentGame && bracketWrapper.current) {
      const x = currentGame.x || 0;
      const y = currentGame.y || 0;
      const { clientWidth, clientHeight } = bracketWrapper.current;

      setTranslation({ x: -x + (clientWidth / 2 - 160), y: -y + (clientHeight / 2 - 60) });
      setScale(1);
    }
  }, [currentGame]);

  useEffect(() => {
    scrollToCurrentGame();
  }, [scrollToCurrentGame]);

  const handleChangeFullscreen = useCallback(() => {
    setIsFullscreenBracket((prev) => !prev);
  }, []);

  const handleMapChange = useCallback(({ scale: nextScale, translation: nextTranslation }: any) => {
    setScale(nextScale);
    setTranslation(nextTranslation);
  }, []);

  return (
    <div className='bracket-wrapper'>
      <div className={classNames('bracket-sub-wrapper', { fullscreen: isFullscreenBracket })} ref={bracketWrapper}>
        <div className='bracket-controls'>
          <Button
            size='small'
            color='primary'
            variant='outlined'
            onClick={handleChangeFullscreen}
            className='fullscreen-button'
          >
            {isFullscreenBracket ? 'Свернуть' : 'На весь экран'}
          </Button>
          <Button
            size='small'
            color='primary'
            variant='outlined'
            onClick={scrollToCurrentGame}
            className='current-game-button'
          >
            Перейти к текущей игре
          </Button>
          <Typography className='hint'>можно перемещать и масштабировать</Typography>
        </div>
        <MapInteractionCSS value={{ scale, translation }} onChange={handleMapChange}>
          {rootGame && <Bracket rootGame={rootGame} currentGame={currentGame?.id || ''} />}
        </MapInteractionCSS>
      </div>
    </div>
  );
};

export default ResizableBracket;
