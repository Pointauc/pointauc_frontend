import { ActionIcon, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowBackUp, IconTicket } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionLogEntry } from './cards/entryTypes';

type ActionLogIcon = typeof IconTicket;

interface ActionLogCardProps {
  type: ActionLogEntry['type'] | string;
  timestamp: string;
  icon: ActionLogIcon;
  color: string;
  subjectLabel: string;
  subject: string;
  detail: ReactNode;
  isReverting: boolean;
  onRevert: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ActionLogCard = ({
  type,
  timestamp,
  icon: Icon,
  color,
  subjectLabel,
  subject,
  detail,
  isReverting,
  onRevert,
  onMouseEnter,
  onMouseLeave,
}: ActionLogCardProps) => {
  const { t } = useTranslation();

  return (
    <Card
      padding='sm'
      radius='sm'
      className={`elevated-3 bg-paper-700 h-[108px] shadow-sm transition duration-150 ease-out ${
        isReverting ? '-translate-x-2 scale-[0.98] opacity-0' : 'translate-x-0 scale-100 opacity-100'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Stack gap={8} className='h-full'>
        <div className='flex items-start gap-2'>
          <Group gap='xs' wrap='nowrap' className='min-w-0 flex-1'>
            <div
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md'
              style={{
                backgroundColor: `var(--mantine-color-${color}-9)`,
                color: `var(--mantine-color-${color}-2)`,
              }}
            >
              <Icon size={20} />
            </div>
            <div className='min-w-0'>
              <Text size='sm' fw={800} c={`${color}`} truncate className='leading-4'>
                {t(`actionsLog.types.${type}`)}
              </Text>
              <Text size='xs' c='dimmed' className='leading-4'>
                {dayjs(timestamp).fromNow()}
              </Text>
            </div>
          </Group>
          <Tooltip label={t('actionsLog.revert')} withArrow>
            <ActionIcon
              size='lg'
              variant='subtle'
              color='gray'
              disabled={isReverting}
              onClick={onRevert}
              aria-label={t('actionsLog.revert')}
              className='shrink-0 hover:bg-white/10'
            >
              <IconArrowBackUp size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
        <div className='min-w-0'>
          <Group gap={6} wrap='nowrap' className='min-w-0'>
            <Text size='xs' fw={800} tt='uppercase' className='text-dimmed shrink-0'>
              {subjectLabel}
            </Text>
            <Text size='sm' fw={800} truncate className='min-w-0'>
              {subject}
            </Text>
          </Group>
          {detail && (
            <Text size='sm' truncate className='mt-0.5 text-slate-400'>
              {detail}
            </Text>
          )}
        </div>
      </Stack>
    </Card>
  );
};

export default ActionLogCard;
