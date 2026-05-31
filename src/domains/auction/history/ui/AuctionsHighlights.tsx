import { Group, Paper, Text, ThemeIcon } from '@mantine/core';

import type { ReactNode } from 'react';

export interface AuctionHighlight {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon: ReactNode;
  color: string;
}

interface AuctionsHighlightsProps {
  highlights: AuctionHighlight[];
  className?: string;
}

const AuctionsHighlights = ({ highlights, className }: AuctionsHighlightsProps) => (
  <div className={`grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-rows-2 ${className ?? ''}`}>
    {highlights.map((highlight) => (
      <Paper
        key={highlight.label}
        withBorder
        radius='md'
        p='md'
        className='flex min-h-[96px] items-center overflow-hidden xl:min-h-0'
      >
        <Group gap='sm' align='flex-start' wrap='nowrap' className='min-w-0'>
          <ThemeIcon color={highlight.color} size='lg' variant='light' radius='md' className='shrink-0'>
            {highlight.icon}
          </ThemeIcon>
          <div className='min-w-0'>
            <Text size='xs' fw={800} tt='uppercase' className='truncate text-neutral-500'>
              {highlight.label}
            </Text>
            <Text fw={900} size='xl' className='truncate'>
              {highlight.value}
            </Text>
            {highlight.helper && (
              <Text size='xs' c='dimmed' className='truncate'>
                {highlight.helper}
              </Text>
            )}
          </div>
        </Group>
      </Paper>
    ))}
  </div>
);

export default AuctionsHighlights;
