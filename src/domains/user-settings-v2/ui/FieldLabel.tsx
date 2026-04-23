import { Group, Stack, Text } from '@mantine/core';

import type { ReactNode } from 'react';

interface FieldLabelProps {
  text: ReactNode;
  hint?: ReactNode;
  leftSection?: ReactNode;
}

const FieldLabel = ({ text, hint, leftSection }: FieldLabelProps) => {
  return (
    <Stack gap={2} miw={0} style={{ flex: 1 }}>
      <Group gap={6} wrap='nowrap'>
        {leftSection}
        <Text fw={500} size='sm'>
          {text}
        </Text>
      </Group>
      {hint ? (
        <Text size='xs' c='dimmed'>
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
};

export default FieldLabel;
