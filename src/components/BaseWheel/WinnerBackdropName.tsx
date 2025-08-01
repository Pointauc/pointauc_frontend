import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import cn from 'classnames';
import { Stack } from '@mantine/core';

import LinkedText from '@components/LinkedText/LinkedText.tsx';

import styles from './WinnerBackdropName.module.css';

interface WinnerBackdropWinProps {
  name: string;
  dropout?: boolean;
  winnerName?: string;
}

const WinnerBackdropName = ({ name, dropout = false, winnerName }: WinnerBackdropWinProps) => {
  const [showWinner, setShowWinner] = useState(false);
  const winnerNameRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (winnerName && dropout) {
      // Wait for strikethrough animation to finish (1500ms)
      const timer = setTimeout(() => {
        setShowWinner(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [winnerName, dropout]);

  const onWinnerRef = useCallback((node: HTMLDivElement) => {
    if (node && nameRef.current) {
      nameRef.current.style.transform = `translateY(-${nameRef.current.clientHeight}px) scale(0.6)`;
      nameRef.current.style.transformOrigin = 'bottom';
    }
  }, []);

  return (
    <Stack gap='xs' className={styles.container} align='center'>
      <div className={cn({ [styles.loserName]: showWinner })} ref={nameRef}>
        <div className={`${dropout ? styles.dropout : ''}`}>
          <LinkedText copyable>{name}</LinkedText>
        </div>
      </div>
      {showWinner && winnerName && (
        <div className={styles.winnerName} ref={onWinnerRef}>
          <LinkedText copyable>{winnerName}</LinkedText>
        </div>
      )}
    </Stack>
  );
};

export default WinnerBackdropName;
