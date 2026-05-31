import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconPlus, IconRefresh, IconSparkles, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LotSearchInput from './LotSearchInput';
import {
  applyLotSuggestions,
  buildSmartSplitEntries,
  distributeEvenly,
  normalizeSplitAmount,
} from './splitBidSuggestions';

import type { Lot } from '@models/slot.model';
import type { SplitBidEntryRequest } from '@reducers/Slots/Slots';
import type { SplitBidDraftEntry, SplitBidDraftTarget } from './splitBidTypes';

interface SplitBidModalProps {
  opened: boolean;
  onClose: () => void;
  bidName: string;
  suggestionText: string;
  totalAmount: number;
  lots: Lot[];
  onSubmit: (entries: SplitBidEntryRequest[]) => void;
}

const checkIsValidTarget = (target: SplitBidDraftTarget): boolean =>
  target.type === 'existing' ? Boolean(target.lotId) : Boolean(target.name.trim());

const createEmptyEntry = (amount: number, totalAmount: number): SplitBidDraftEntry => ({
  id: Math.random().toString(),
  lotInput: '',
  target: { type: 'new', name: '' },
  amount,
  percentage: totalAmount > 0 ? normalizeSplitAmount((amount / totalAmount) * 100) : 0,
});

const SplitBidModal = ({ opened, onClose, bidName, suggestionText, totalAmount, lots, onSubmit }: SplitBidModalProps) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<SplitBidDraftEntry[]>([]);

  const resetToSmartSuggestions = (): void => {
    setEntries(applyLotSuggestions(buildSmartSplitEntries(suggestionText, totalAmount), lots));
  };

  useEffect(() => {
    if (opened) {
      resetToSmartSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, suggestionText, totalAmount]);

  const allocatedAmount = useMemo(
    () => normalizeSplitAmount(entries.reduce((total, entry) => total + entry.amount, 0)),
    [entries],
  );
  const remainingAmount = normalizeSplitAmount(totalAmount - allocatedAmount);
  const canSubmit =
    entries.length > 0 &&
    Math.abs(remainingAmount) < 0.01 &&
    entries.every((entry) => entry.amount > 0 && checkIsValidTarget(entry.target));

  const updateEntry = (id: string, transform: (entry: SplitBidDraftEntry) => SplitBidDraftEntry): void => {
    setEntries((currentEntries) => currentEntries.map((entry) => (entry.id === id ? transform(entry) : entry)));
  };

  const updateAmount = (id: string, amount: number): void => {
    updateEntry(id, (entry) => ({
      ...entry,
      amount: normalizeSplitAmount(amount),
      percentage: totalAmount > 0 ? normalizeSplitAmount((amount / totalAmount) * 100) : 0,
    }));
  };

  const updatePercentage = (id: string, percentage: number): void => {
    updateEntry(id, (entry) => {
      const amount = normalizeSplitAmount((totalAmount * percentage) / 100);

      return {
        ...entry,
        amount,
        percentage: normalizeSplitAmount(percentage),
      };
    });
  };

  const addEntry = (): void => {
    setEntries((currentEntries) => [
      ...currentEntries,
      createEmptyEntry(Math.max(remainingAmount, 0), totalAmount),
    ]);
  };

  const removeEntry = (id: string): void => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
  };

  const handleSubmit = (): void => {
    if (!canSubmit) {
      return;
    }

    onSubmit(
      entries.map(({ amount, target }) => ({
        amount,
        target,
      })),
    );
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('bid.split.title')} size='xl' centered>
      <Stack gap='sm'>
        <div className='grid grid-cols-1 items-center gap-3 rounded border border-paper-700 bg-paper-transparent-50 px-3 py-2 elevated-1 md:grid-cols-[minmax(0,1fr)_auto]'>
          <div className='min-w-0'>
            <Group gap='xs' wrap='nowrap'>
              <Text size='xs' c='dimmed' fw={700} className='shrink-0'>
                {t('bid.split.sourceBid')}
              </Text>
              <Text size='sm' fw={700} truncate className='min-w-0'>
                {bidName}
              </Text>
            </Group>
          </div>
          <Group gap={0} wrap='nowrap' className='justify-start md:justify-end'>
            <div className='min-w-20 pr-4 text-left md:text-right'>
              <Text size='xs' c='dimmed'>
                {t('bid.split.totalLabel')}
              </Text>
              <Text size='sm' fw={700}>
                {totalAmount}
              </Text>
            </div>
            <div className='min-w-20 border-l border-paper-700 px-4 text-left md:text-right'>
              <Text size='xs' c='dimmed'>
                {t('bid.split.allocatedLabel')}
              </Text>
              <Text size='sm' fw={700}>
                {allocatedAmount}
              </Text>
            </div>
            <div className='min-w-20 border-l border-paper-700 pl-4 text-left md:text-right'>
              <Text size='xs' c='dimmed'>
                {t('bid.split.remainingLabel')}
              </Text>
              <Text size='sm' fw={700} c={Math.abs(remainingAmount) < 0.01 ? 'green' : 'yellow'}>
                {remainingAmount}
              </Text>
            </div>
          </Group>
        </div>

        <Stack gap='xs'>
          {entries.map((entry, index) => (
            <div key={entry.id} className='rounded border border-paper-700 bg-paper-transparent-50 p-3 elevated-1'>
              <Group justify='space-between' align='center' mb='xs'>
                <Group gap='xs'>
                  <Text size='sm' fw={700}>
                    {t('bid.split.entryTitle', { index: index + 1 })}
                  </Text>
                  <Badge size='xs' color={entry.target.type === 'existing' ? 'blue' : 'green'} variant='light'>
                    {entry.target.type === 'existing' ? t('bid.split.addBadge') : t('bid.split.createBadge')}
                  </Badge>
                </Group>
                <Tooltip label={t('bid.split.deleteEntry')}>
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length === 1}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <div className='grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_8rem_7rem]'>
                <div className='min-w-0'>
                  <Text size='xs' c='dimmed' fw={700} mb={4}>
                    {t('bid.split.lotColumn')}
                  </Text>
                  <LotSearchInput
                    value={entry.lotInput}
                    lots={lots}
                    onChange={(value) =>
                      updateEntry(entry.id, (currentEntry) => ({
                        ...currentEntry,
                        lotInput: value,
                        target: { type: 'new', name: value },
                      }))
                    }
                    onSelect={(target, inputValue) =>
                      updateEntry(entry.id, (currentEntry) => ({
                        ...currentEntry,
                        lotInput: inputValue,
                        target,
                      }))
                    }
                  />
                </div>
                <NumberInput
                  label={t('bid.split.amountLabel')}
                  min={0}
                  decimalScale={2}
                  value={entry.amount}
                  onChange={(value) => updateAmount(entry.id, typeof value === 'number' ? value : Number(value) || 0)}
                />
                <NumberInput
                  label={t('bid.split.percentageLabel')}
                  min={0}
                  max={100}
                  decimalScale={2}
                  suffix='%'
                  value={entry.percentage}
                  onChange={(value) =>
                    updatePercentage(entry.id, typeof value === 'number' ? value : Number(value) || 0)
                  }
                />
              </div>
            </div>
          ))}
          <Button
            variant='light'
            size='sm'
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={addEntry}
            className='border border-dashed border-paper-700'
          >
            {t('bid.split.addEntry')}
          </Button>
        </Stack>

        <Group justify='space-between' align='center' className='border-t border-paper-700 pt-3'>
          <Group gap='xs'>
            <Button
              variant='subtle'
              size='sm'
              leftSection={<IconRefresh size={16} />}
              onClick={() => setEntries(distributeEvenly(entries, totalAmount))}
            >
              {t('bid.split.distributeEvenly')}
            </Button>
            <Button variant='subtle' size='sm' leftSection={<IconSparkles size={16} />} onClick={resetToSmartSuggestions}>
              {t('bid.split.smartSuggestions')}
            </Button>
          </Group>
          <Group gap='xs'>
            <Button variant='default' size='sm' onClick={onClose}>
              {t('bid.split.cancel')}
            </Button>
            <Button size='sm' leftSection={<IconCheck size={16} />} onClick={handleSubmit} disabled={!canSubmit}>
              {t('bid.split.apply')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SplitBidModal;
