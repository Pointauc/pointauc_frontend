import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';

import { getParticipantInitials, getParticipantScoreValue } from '../lib/leaderboardDisplay';
import { type LeaderboardSort, type ParticipantScore } from '../lib/statistics';

interface LeaderboardRowsProps {
  scores: ParticipantScore[];
  sort: LeaderboardSort;
}

const LeaderboardRows = ({ scores, sort }: LeaderboardRowsProps) => (
  <Stack className='gap-1.5'>
    {scores.map((score, index) => (
      <Group
        key={score.id}
        justify='space-between'
        className='elevated-1 bg-paper-600 rounded-md px-3 py-1'
        wrap='nowrap'
      >
        <Group gap='sm' className='min-w-0' wrap='nowrap'>
          <Text c='dimmed' fw={800} w={22}>
            {index + 4}
          </Text>
          <Avatar size='sm' radius='xl' color='violet'>
            {getParticipantInitials(score.displayName)}
          </Avatar>
          <Text size='sm' fw={600} className='min-w-0 truncate'>
            {score.displayName}
          </Text>
        </Group>
        <Badge color='teal' variant='light' className='shrink-0'>
          {getParticipantScoreValue(score, sort)}
        </Badge>
      </Group>
    ))}
  </Stack>
);

export default LeaderboardRows;
