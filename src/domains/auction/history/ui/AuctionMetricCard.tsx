import { Paper, Text } from '@mantine/core';

import type { ComponentType, ReactNode } from 'react';

interface AuctionMetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ComponentType<{ size?: number; color?: string }>;
  color?: string;
}

const AuctionMetricCard = ({ label, value, helper, icon: Icon, color = 'violet' }: AuctionMetricCardProps) => (
  <Paper withBorder radius='md' p='0' className='flex min-h-24 items-center justify-center gap-4'>
    {Icon && <Icon size={56} color={color} />}
    <div className='relative flex h-full flex-col items-start justify-center gap-0'>
      <Text fw={800} className='truncate text-2xl' c={color}>
        {value}
      </Text>
      <Text size='xs' fw={600} tt='uppercase' className='tracking-wider text-neutral-400'>
        {label}
      </Text>
      {helper && (
        <Text mt={4} size='xs' c='dimmed' className='absolute bottom-1 left-0 line-clamp-1'>
          {helper}
        </Text>
      )}
    </div>
  </Paper>
);

export default AuctionMetricCard;
