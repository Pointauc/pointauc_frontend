import { Skeleton } from '@mantine/core';
import { Stack } from '@mantine/core';

const RulesSkeleton: React.FC = () => (
  <Stack gap='sm' w={370}>
    <Skeleton height={200} radius='sm' />
    <Skeleton height={40} radius='sm' />
    <Skeleton height={80} radius='sm' />
  </Stack>
);

export default RulesSkeleton;
