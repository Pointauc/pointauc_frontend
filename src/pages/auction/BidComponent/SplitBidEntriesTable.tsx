import { ActionIcon, Badge, Button, NumberInput, Popover, Table, Tooltip } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import LotSearchInput from './LotSearchInput';

import type { Lot } from '@models/slot.model';
import type { SplitBidDraftEntry } from './splitBidTypes';

const PERCENTAGE_SUGGESTIONS = [20, 25, 33, 50];

interface SplitBidEntriesTableProps {
  entries: SplitBidDraftEntry[];
  lots: Lot[];
  focusedPercentageEntryId: string | null;
  onFocusPercentageEntry: (id: string | null) => void;
  onUpdateEntry: (id: string, transform: (entry: SplitBidDraftEntry) => SplitBidDraftEntry) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onUpdatePercentage: (id: string, percentage: number) => void;
  onApplyPercentageSuggestion: (id: string, percentage: number) => void;
  onRemoveEntry: (id: string) => void;
}

const SplitBidEntriesTable = ({
  entries,
  lots,
  focusedPercentageEntryId,
  onFocusPercentageEntry,
  onUpdateEntry,
  onUpdateAmount,
  onUpdatePercentage,
  onApplyPercentageSuggestion,
  onRemoveEntry,
}: SplitBidEntriesTableProps) => {
  const { t } = useTranslation();

  return (
    <div className='overflow-hidden rounded-lg border border-white/10 bg-[var(--mantine-color-dark-8)] shadow-[0_18px_36px_rgba(0,0,0,0.18)]'>
      <Table className='w-full border-collapse'>
        <Table.Thead className='bg-[var(--mantine-color-dark-7)]'>
          <Table.Tr className='border-b border-white/10'>
            <Table.Th className='w-[96px] px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
              {t('bid.split.entryColumn')}
            </Table.Th>
            <Table.Th className='min-w-[260px] px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
              {t('bid.split.lotColumn')}
            </Table.Th>
            <Table.Th className='w-[150px] px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
              {t('bid.split.amountLabel')}
            </Table.Th>
            <Table.Th className='w-[140px] px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
              {t('bid.split.percentageLabel')}
            </Table.Th>
            <Table.Th className='w-[72px] px-4 py-3 text-right text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase' />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {entries.map((entry, index) => (
            <Table.Tr key={entry.id} className='border-b border-white/5 transition-colors hover:bg-white/[0.02]'>
              <Table.Td className='p-2 align-middle'>
                <div className='flex flex-col gap-1 pl-2'>
                  <span className='text-sm font-bold'>{index + 1}</span>
                  <Badge
                    size='xs'
                    color={entry.target.type === 'existing' ? 'blue' : 'green'}
                    variant='light'
                    className='w-fit'
                  >
                    {entry.target.type === 'existing' ? t('bid.split.addBadge') : t('bid.split.createBadge')}
                  </Badge>
                </div>
              </Table.Td>
              <Table.Td className='min-w-[260px] p-2 align-middle'>
                <LotSearchInput
                  value={entry.lotInput}
                  lots={lots}
                  onChange={(value) =>
                    onUpdateEntry(entry.id, (currentEntry) => ({
                      ...currentEntry,
                      lotInput: value,
                      target: { type: 'new', name: value },
                    }))
                  }
                  onSelect={(target, inputValue) =>
                    onUpdateEntry(entry.id, (currentEntry) => ({
                      ...currentEntry,
                      lotInput: inputValue,
                      target,
                    }))
                  }
                />
              </Table.Td>
              <Table.Td className='w-[150px] p-2 align-middle'>
                <NumberInput
                  min={0}
                  decimalScale={2}
                  value={entry.amount}
                  onChange={(value) => onUpdateAmount(entry.id, typeof value === 'number' ? value : Number(value) || 0)}
                  size='sm'
                  aria-label={t('bid.split.amountLabel')}
                  className='w-full max-w-[130px]'
                />
              </Table.Td>
              <Table.Td className='w-[140px] p-2 align-middle'>
                <Popover
                  opened={focusedPercentageEntryId === entry.id}
                  position='right'
                  withArrow
                  shadow='md'
                  withinPortal
                  offset={8}
                >
                  <Popover.Target>
                    <NumberInput
                      min={0}
                      max={100}
                      decimalScale={2}
                      suffix='%'
                      value={entry.percentage}
                      onChange={(value) =>
                        onUpdatePercentage(entry.id, typeof value === 'number' ? value : Number(value) || 0)
                      }
                      onFocus={() => onFocusPercentageEntry(entry.id)}
                      onBlur={() => onFocusPercentageEntry(null)}
                      size='sm'
                      aria-label={t('bid.split.percentageLabel')}
                      className='w-full max-w-[120px]'
                    />
                  </Popover.Target>
                  <Popover.Dropdown className='border-white/10 bg-[var(--mantine-color-dark-7)] p-2'>
                    <div className='flex flex-wrap gap-1.5'>
                      {PERCENTAGE_SUGGESTIONS.map((percentage) => (
                        <Button
                          key={percentage}
                          size='compact-xs'
                          variant='light'
                          leftSection={<IconPlus size={12} />}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => onApplyPercentageSuggestion(entry.id, percentage)}
                        >
                          {t('bid.split.percentageSuggestion', { percentage })}
                        </Button>
                      ))}
                    </div>
                  </Popover.Dropdown>
                </Popover>
              </Table.Td>
              <Table.Td className='w-[72px] p-2 text-right align-middle'>
                <Tooltip label={t('bid.split.deleteEntry')}>
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    onClick={() => onRemoveEntry(entry.id)}
                    disabled={entries.length === 1}
                    size='lg'
                    aria-label={t('bid.split.deleteEntry')}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default SplitBidEntriesTable;
