import { FC } from 'react';
import { Text } from '@mantine/core';

import styles from './CardSwitchLabel.module.css';

interface CardSwitchLabelProps {
  text: string;
}

const CardSwitchLabel: FC<CardSwitchLabelProps> = ({ text }) => {
  return (
    <>
      <Text>{text}</Text>
      <div className={styles.groupClickOverlay} />
    </>
  );
};

export default CardSwitchLabel;
