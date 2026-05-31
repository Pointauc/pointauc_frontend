import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';

interface EmptyLeaderboardProps {
  label: string;
}

const EmptyLeaderboard = ({ label }: EmptyLeaderboardProps) => (
  <Stack align='center' justify='center' className='min-h-40 flex-1'>
    <ThemeIcon color='gray' variant='light' size='xl' radius='xl'>
      <IconMoodEmpty />
    </ThemeIcon>
    <Text size='sm' c='dimmed'>
      {label}
    </Text>
  </Stack>
);

export default EmptyLeaderboard;
