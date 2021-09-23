import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { MapInteractionCSS } from 'react-map-interaction';
import { Button, Typography } from '@material-ui/core';
import SlotsBracket, { SlotsBracketProps } from '../../SlotsBracket/SlotsBracket';
import { Point } from '../../../services/SpinPaceService';
import { Game } from '../../Bracket/components/model';

interface ResizableBracket extends Omit<SlotsBracketProps, 'currentGame'> {
  currentGame?: Game | null;
}

const ResizableBracket: FC<ResizableBracket> = ({ currentGame, ...props }) => {
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

  const handleMapChange = useCallback(({ scale: nextScale, translation: nextTranslation }) => {
    setScale(nextScale);
    setTranslation(nextTranslation);
  }, []);

  return (
    <div className="bracket-wrapper">
      <div className={classNames('bracket-sub-wrapper', { fullscreen: isFullscreenBracket })} ref={bracketWrapper}>
        <div className="bracket-controls">
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={handleChangeFullscreen}
            className="fullscreen-button"
          >
            {isFullscreenBracket ? 'Свернуть' : 'На весь экран'}
          </Button>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={scrollToCurrentGame}
            className="current-game-button"
          >
            Перейти к текущей игре
          </Button>
          <Typography className="hint">можно перемещать и масштабировать</Typography>
        </div>
        <MapInteractionCSS value={{ scale, translation }} onChange={handleMapChange}>
          <SlotsBracket {...props} currentGame={currentGame?.id || ''} />
        </MapInteractionCSS>
      </div>
    </div>
  );
};

export default ResizableBracket;
