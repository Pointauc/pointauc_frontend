import { ActionIcon, Group } from '@mantine/core';
import { IconPin } from '@tabler/icons-react';

import TextWithHint from '../TextWithHint';

interface SettingLabelProps {
  text: string;
  hint?: string | React.ReactNode;
  canPin?: boolean;
  leftSection?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 240,
  md: 280,
  lg: 330,
};

const SettingLabel = ({ text, hint, canPin, leftSection, size = 'md' }: SettingLabelProps) => {
  return (
    <Group miw={sizeMap[size]} gap='xs'>
      {canPin && (
        <ActionIcon>
          <IconPin />
        </ActionIcon>
      )}
      {leftSection}
      <TextWithHint hint={hint}>{text}</TextWithHint>
    </Group>
  );
};

export default SettingLabel;
