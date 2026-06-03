import { CloseButton, Text } from '@mantine/core';

import classes from './BidComponent.module.css';

import type { ReactNode } from 'react';


interface BidHeaderProps {
  title: ReactNode;
  username: string;
  onRemove: () => void;
  deleteLabel: string;
}

const BidHeader = ({ title, username, onRemove, deleteLabel }: BidHeaderProps) => (
  <div className={classes.header}>
    <Text size='xl' className={classes.headerTitle} title={username}>
      {title}
    </Text>
    <CloseButton onClick={onRemove} c='white' radius='xl' title={deleteLabel} size='lg' />
  </div>
);

export default BidHeader;
