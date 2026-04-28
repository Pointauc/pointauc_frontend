import React, { useState, useEffect, useRef, useCallback } from 'react';
import cn from 'classnames';
import { Stack } from '@mantine/core';

import LotNameText from '@domains/links/ui/LotNameText';

import styles from './WinnerBackdropName.module.css';

interface WinnerBackdropWinProps {
  name: string;
  dropout?: boolean;
  winnerName?: string;
}

const WinnerBackdropName = ({ name, dropout = false, winnerName }: WinnerBackdropWinProps) => {
  const [showWinner, setShowWinner] = useState(false);
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
          <LotNameText value={name} />
        </div>
      </div>
      {showWinner && winnerName && (
        <div className={styles.winnerName} ref={onWinnerRef}>
          <LotNameText value={winnerName} />
        </div>
      )}
    </Stack>
  );
};

export default WinnerBackdropName;
