import { Popover } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useRef } from 'react';

import { EditorActionIcon } from '../BubbleMenu/EditorActionIcon';

interface ExtraControlsProps {
  /** Additional controls to render in the popover */
  children: React.ReactNode;
}

const ExtraControls = ({ children }: ExtraControlsProps) => {
  const initialPosition = useRef<{ x: number; y: number } | null>(null);

  return (
    <Popover
      middlewares={{
        shift: {
          limiter: {
            fn: (state) => {
              initialPosition.current = initialPosition.current ?? { x: state.x, y: state.y };
              return {
                x: initialPosition.current.x,
                y: initialPosition.current.y,
              };
            },
          },
        },
        flip: false,
        inline: false,
        size: false,
      }}
    >
      <Popover.Target>
        <EditorActionIcon icon={<IconSettings />} title='Rules Settings' />
      </Popover.Target>
      <Popover.Dropdown>{children}</Popover.Dropdown>
    </Popover>
  );
};

export default ExtraControls;
