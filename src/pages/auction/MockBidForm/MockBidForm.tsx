import { FC, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Button, Text, Group, Tooltip, ActionIcon, Stack, Box } from '@mantine/core';
import { IconSend, IconDice5 } from '@tabler/icons-react';

import { useAppForm } from '@shared/tanstack-form/lib/form';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';

export interface MockBidFormData extends Purchase {
  randomValues: boolean;
}

export const defaultMockBidData: MockBidFormData = {
  cost: 100,
  username: 'test',
  message: 'test',
  isDonation: false,
  timestamp: new Date().toISOString(),
  color: '#000000',
  id: '1',
  source: 'Mock',
  randomValues: true,
};

export type MockBidFormInstance = ReturnType<typeof useMockBidForm>;

/** Hook that creates and manages the mock bid form state. */
export function useMockBidForm() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  return useAppForm({
    defaultValues: defaultMockBidData,
    onSubmit: ({ value }) => {
      const { randomValues, ...rest } = value;
      if (randomValues) {
        dispatch(
          processRedemption({
            ...rest,
            id: Math.random().toString(),
            cost: Math.floor(Math.random() * 1000),
            message: `Random message ${Math.random().toString(36).substring(7)}`,
            username: `User_${Math.random().toString(36).substring(7)}`,
          }),
        );
      } else {
        dispatch(processRedemption({ source: 'Mock', id: Math.random().toString(), cost: 100 } as any));
      }
    },
  });
}

interface MockBidFormProps {
  form: MockBidFormInstance;
}

/**
 * Developer testing form for simulating incoming bids.
 * Dispatches mock Purchase objects to test auction behavior without real integrations.
 * Supports both fixed values and randomized data for rapid testing scenarios.
 * Use Ctrl+Enter to quickly submit the form.
 */
const MockBidForm: FC<MockBidFormProps> = ({ form }) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  const handleBatchSubmit = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      form.handleSubmit();
    }
  }, [form]);

  // Keyboard shortcut: Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        formRef.current?.requestSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <form ref={formRef} onSubmit={handleFormSubmit}>
      <Stack gap='xs'>
        <form.Subscribe selector={(state) => state.values.randomValues}>
          {(isRandomMode) => (
            <>
              <Group gap='sm' wrap='nowrap'>
                <Box w={100}>
                  <form.AppField
                    name='cost'
                    children={(field) => <field.NumberField label='Cost' size='sm' disabled={isRandomMode} />}
                  />
                </Box>
                <Box style={{ flex: 1 }}>
                  <form.AppField
                    name='username'
                    children={(field) => <field.TextField label='Username' size='sm' disabled={isRandomMode} />}
                  />
                </Box>
              </Group>

              <form.AppField
                name='message'
                children={(field) => <field.TextField label='Message' size='sm' disabled={isRandomMode} />}
              />
            </>
          )}
        </form.Subscribe>

        <Group gap='lg'>
          <form.AppField
            name='randomValues'
            children={(field) => (
              <field.SwitchField
                label={
                  <Group gap={4}>
                    <IconDice5 size={14} />
                    <Text>Random</Text>
                  </Group>
                }
                size='sm'
              />
            )}
          />
          <form.AppField
            name='isDonation'
            children={(field) => <field.SwitchField label={<Text>Donation</Text>} size='sm' />}
          />
        </Group>

        <Group gap='sm'>
          <Tooltip label='Ctrl+Enter' position='bottom'>
            <Button type='submit' variant='filled' size='sm' flex={1}>
              <Group gap='xs'>
                <IconSend size={14} />
                <span>Send Bid</span>
              </Group>
            </Button>
          </Tooltip>
          <Tooltip label='Send 5 random bids'>
            <ActionIcon variant='filled' size='lg' onClick={handleBatchSubmit}>
              <Text size='sm' fw={700}>
                x5
              </Text>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </form>
  );
};

export default MockBidForm;
