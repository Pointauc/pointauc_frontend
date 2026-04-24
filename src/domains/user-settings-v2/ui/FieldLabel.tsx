import { Text } from '@mantine/core';

import type { ReactNode } from 'react';

interface FieldLabelProps {
  text: ReactNode;
  hint?: ReactNode;
  leftSection?: ReactNode;
}

const FieldLabel = ({ text, hint, leftSection }: FieldLabelProps) => {
  return (
    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
      <div className='flex flex-nowrap items-center gap-1.5'>
        {leftSection}
        <Text fw={500} size='sm'>
          {text}
        </Text>
      </div>
      {hint ? (
        <Text size='xs' c='dimmed'>
          {hint}
        </Text>
      ) : null}
    </div>
  );
};

export default FieldLabel;
