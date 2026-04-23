import { Box, Group, Stack, Text } from '@mantine/core';
import { type ReactNode } from 'react';

import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';

interface SettingsSectionProps {
  id: string;
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

const SettingsSection = ({ id, title, icon, children }: SettingsSectionProps) => {
  return (
    <Stack component='section' gap='md'>
      <Group component='h2' id={id} gap='xs' align='center' wrap='nowrap' style={{ scrollMarginTop: '1.5rem' }}>
        {icon ? (
          <Box component='span' c='var(--mantine-primary-color-filled)' style={{ display: 'inline-flex' }}>
            {icon}
          </Box>
        ) : null}
        <Text component='span' fw={700} size='lg'>
          {title}
        </Text>
      </Group>
      {children}
    </Stack>
  );
};

export default SettingsSection;
