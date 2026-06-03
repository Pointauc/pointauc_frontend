import { Avatar, Badge, Text } from '@mantine/core';
import clsx from 'clsx';

import bronzeMedalImage from '@assets/img/medal_bronze.png';
import goldMedalImage from '@assets/img/medal_gold.png';
import silverMedalImage from '@assets/img/medal_silver.png';

import { getParticipantScoreValue } from '../lib/leaderboardDisplay';
import { type LeaderboardSort, type ParticipantScore } from '../lib/statistics';

const medalImages = [goldMedalImage, silverMedalImage, bronzeMedalImage];
const participantColors = ['yellow', 'gray', 'orange'];

interface ParticipantPodiumItemProps {
  score?: ParticipantScore;
  index: number;
  sort: LeaderboardSort;
}

const ParticipantPodiumItem = ({ score, index, sort }: ParticipantPodiumItemProps) => {
  const participantColor = participantColors[index] ?? 'violet';
  const medalImage = medalImages[index];
  const isWinner = index === 0;

  if (!score) {
    return <div aria-hidden='true' className={clsx('min-w-0 flex-1')} />;
  }

  return (
    <div className={clsx('flex min-w-0 flex-1 flex-col items-center')}>
      <div className={clsx('relative overflow-visible', isWinner ? 'size-[40px]' : 'size-[36px]')}>
        <img
          src={medalImage}
          alt=''
          className='pointer-events-none absolute top-1/2 left-1/2 size-[230%] max-w-none -translate-x-1/2 -translate-y-[45%] object-contain'
          draggable={false}
        />
      </div>
      <div className={clsx(isWinner ? 'h-[56px]' : 'h-[46px]', 'relative mb-2')}>
        <Avatar mt={6} size={isWinner ? 52 : 42} radius='xl' color={participantColor} name={score.displayName} />
        <Badge
          color='teal'
          variant='light'
          size='sm'
          fz='xs'
          className='absolute bottom-0 left-1/2 w-max -translate-x-1/2 translate-y-3/4'
        >
          {getParticipantScoreValue(score, sort)}
        </Badge>
      </div>
      <Text mt={6} fw={800} size='sm' ta='center' className='max-w-24 truncate'>
        {score.displayName}
      </Text>
    </div>
  );
};

export default ParticipantPodiumItem;
