import { Text } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';

import type { ReactNode } from 'react';

interface FieldLabelProps {
  id?: string;
  text: ReactNode;
  leftSection?: ReactNode;
  withDescriptionIcon?: boolean;
}

const FieldLabel = ({ id, text, leftSection, withDescriptionIcon }: FieldLabelProps) => {
  return (
    <div className='flex min-w-0 flex-1 flex-nowrap items-center gap-1.5'>
      {leftSection}
      <Text id={id} fw={500} size='sm'>
        {text}
      </Text>
      {withDescriptionIcon ? (
        <span className='text-dimmed flex flex-shrink-0 items-center justify-center'>
          <IconHelp size={20} aria-hidden />
        </span>
      ) : null}
    </div>
  );
};

export default FieldLabel;
