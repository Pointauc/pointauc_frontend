import { FC, useCallback, MouseEvent, useState } from 'react';
import { Button, Popover, Tooltip } from '@mantine/core';
import { IconFlask } from '@tabler/icons-react';

import MockBidForm, { useMockBidForm } from './MockBidForm';

/**
 * Button that opens a popover with the MockBidForm.
 * Form state is preserved when the popover is closed.
 * Ctrl+Click submits the form directly without opening the popover.
 */
const MockBidButton: FC = () => {
  const [opened, setOpened] = useState(false);
  const form = useMockBidForm();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (e.ctrlKey) {
        e.preventDefault();
        form.handleSubmit();
      } else {
        setOpened((prev) => !prev);
      }
    },
    [form],
  );

  return (
    <Popover closeOnClickOutside opened={opened} onChange={setOpened} keepMounted position='top-end'>
      <Popover.Target>
        <Tooltip label='Ctrl+Click to send directly' position='top'>
          <Button variant='filled' leftSection={<IconFlask size={16} />} onClick={handleClick}>
            Send Test Bid
          </Button>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <MockBidForm form={form} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default MockBidButton;
