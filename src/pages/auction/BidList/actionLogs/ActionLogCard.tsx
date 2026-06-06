import { ActionIcon, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowBackUp, IconCube, IconTicket, IconUserFilled } from '@tabler/icons-react';
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
  subjectLabel?: ReactNode;
  subject?: string;
  userName?: string;
  lotName?: string;
  detail?: ReactNode;
  cardTooltip?: ReactNode;
  priceDelta?: number;
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
  userName,
  lotName,
  detail,
  cardTooltip,
  priceDelta,
  isReverting,
  onRevert,
  onMouseEnter,
  onMouseLeave,
}: ActionLogCardProps) => {
  const { t } = useTranslation();
  const hasPriceDelta = priceDelta !== undefined;
  const priceDeltaValue = priceDelta ?? 0;
  const priceDeltaLabel = Math.sign(priceDeltaValue) >= 0 ? `+${priceDeltaValue}` : priceDeltaValue;

  const content = (
    <Card
      padding='sm'
      radius='sm'
      className={`elevated-3 bg-paper-700 relative shadow-sm transition duration-150 ease-out ${
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
        <div className='min-w-0 space-y-1'>
          {userName && (
            <Group gap={6} wrap='nowrap' className='min-w-0'>
              <IconUserFilled size={16} className='text-dimmed shrink-0' />
              <Text size='sm' fw={800} truncate className='min-w-0 flex-1'>
                {userName}
              </Text>
              {!lotName && hasPriceDelta && (
                <Text
                  size='lg'
                  fw={800}
                  c={Math.sign(priceDeltaValue) >= 0 ? 'green' : 'red'}
                  lh='sm'
                  className='shrink-0'
                >
                  {priceDeltaLabel}
                </Text>
              )}
            </Group>
          )}
          {lotName && (
            <Group gap={6} wrap='nowrap' align='center' className='min-w-0'>
              <IconCube size={16} className='text-dimmed shrink-0' />
              <Text size='sm' fw={800} truncate className='min-w-0 flex-1'>
                {lotName}
              </Text>
              {hasPriceDelta && (
                <Text
                  size='md'
                  fw={700}
                  c={Math.sign(priceDeltaValue) >= 0 ? 'green' : 'red'}
                  lh='sm'
                  className='shrink-0'
                >
                  {priceDeltaLabel}
                </Text>
              )}
            </Group>
          )}
          {!userName && !lotName && subject && (
            <Group gap={6} wrap='nowrap' className='min-w-0'>
              {subjectLabel && (
                <Text size='xs' fw={800} tt='uppercase' className='text-dimmed shrink-0'>
                  {subjectLabel}
                </Text>
              )}
              <Text size='sm' fw={800} truncate className='min-w-0'>
                {subject}
              </Text>
            </Group>
          )}
          {detail && <div className='mt-0.5 truncate text-sm text-slate-400'>{detail}</div>}
        </div>
      </Stack>
    </Card>
  );

  return (
    <Tooltip
      label={cardTooltip}
      disabled={!cardTooltip}
      withArrow
      position='left-start'
      multiline
      maw={320}
      openDelay={250}
    >
      <div className='w-full'>{content}</div>
    </Tooltip>
  );
};

export default ActionLogCard;
