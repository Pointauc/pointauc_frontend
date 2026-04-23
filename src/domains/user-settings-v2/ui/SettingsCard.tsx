import { Card } from '@mantine/core';
import { type ReactNode } from 'react';
import clsx from 'clsx';

import type { CardProps } from '@mantine/core';

interface SettingsCardProps extends CardProps {
  nested?: boolean;
  children: ReactNode;
}

const SettingsCard = ({ nested = false, children, ...props }: SettingsCardProps) => {
  return (
    <div className={clsx({ 'p-2': nested })}>
      <Card {...props} withBorder radius='md' shadow='sm' p={0} bg={nested ? 'dark.7' : 'dark.8'}>
        {children}
      </Card>
    </div>
  );
};

export default SettingsCard;
