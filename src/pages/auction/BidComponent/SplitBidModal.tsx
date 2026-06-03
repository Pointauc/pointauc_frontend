import { Button, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconPlus, IconHelp, IconRefresh } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SplitBidEntriesTable from './SplitBidEntriesTable';
import {
  addSplitEntry,
  distributeRemovedAmount,
  getSuggestedPercentageAmount,
  rebalanceEntriesByEditedAmount,
} from './splitBidRebalancing';
import {
  applyLotSuggestions,
  buildSmartSplitEntries,
  distributeEvenly,
  normalizeSplitAmount,
} from './splitBidSuggestions';

import type { Lot } from '@models/slot.model';
import type { SplitBidEntryRequest } from '@reducers/Slots/Slots';
import type { SplitBidDraftEntry } from './splitBidTypes';

interface SplitBidModalProps {
  opened: boolean;
  onClose: () => void;
  bidName: string;
  suggestionText: string;
  totalAmount: number;
  lots: Lot[];
  onSubmit: (entries: SplitBidEntryRequest[]) => void;
}

const getSubmitDisabledReason = (
  entries: SplitBidDraftEntry[],
  remainingAmount: number,
  t: ReturnType<typeof useTranslation>['t'],
): string | null => {
  if (!entries.length) {
    return t('bid.split.applyDisabled.noEntries');
  }

  if (entries.some((entry) => entry.amount <= 0)) {
    return t('bid.split.applyDisabled.invalidAmount');
  }

  if (entries.some((entry) => entry.target.type === 'existing' && !entry.target.lotId)) {
    return t('bid.split.applyDisabled.invalidLot');
  }

  if (Math.abs(remainingAmount) >= 0.01) {
    return t('bid.split.applyDisabled.remainingAmount', { amount: remainingAmount });
  }

  return null;
};

const SplitBidModal = ({
  opened,
  onClose,
  bidName,
  suggestionText,
  totalAmount,
  lots,
  onSubmit,
}: SplitBidModalProps) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<SplitBidDraftEntry[]>([]);
  const [focusedPercentageEntryId, setFocusedPercentageEntryId] = useState<string | null>(null);

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
  const submitDisabledReason = getSubmitDisabledReason(entries, remainingAmount, t);
  const canSubmit = submitDisabledReason == null;

  const updateEntry = (id: string, transform: (entry: SplitBidDraftEntry) => SplitBidDraftEntry): void => {
    setEntries((currentEntries) => currentEntries.map((entry) => (entry.id === id ? transform(entry) : entry)));
  };

  const updateAmount = (id: string, amount: number): void => {
    setEntries((currentEntries) => rebalanceEntriesByEditedAmount(currentEntries, id, amount, totalAmount));
  };

  const updatePercentage = (id: string, percentage: number): void => {
    updateAmount(id, normalizeSplitAmount((totalAmount * percentage) / 100));
  };

  const applyPercentageSuggestion = (id: string, percentage: number): void => {
    updateAmount(id, getSuggestedPercentageAmount(percentage, totalAmount));
    setFocusedPercentageEntryId(null);
  };

  const addEntry = (): void => {
    setEntries((currentEntries) => addSplitEntry(currentEntries, remainingAmount, totalAmount));
  };

  const removeEntry = (id: string): void => {
    setEntries((currentEntries) => {
      const removedEntry = currentEntries.find((entry) => entry.id === id);
      const nextEntries = currentEntries.filter((entry) => entry.id !== id);

      if (!removedEntry || !nextEntries.length) {
        return nextEntries;
      }

      return distributeRemovedAmount(nextEntries, removedEntry.amount, totalAmount);
    });
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap='xs' align='center'>
          <Text fw={700}>{t('bid.split.title')}</Text>

          <Tooltip
            withArrow
            multiline
            label={
              <Stack gap={6} className='w-80'>
                <Text size='xs'>{t('bid.split.syntaxRulesTooltip.intro')}</Text>
                <Text size='xs'>{t('bid.split.syntaxRulesTooltip.amounts')}</Text>
                <Text size='xs'>{t('bid.split.syntaxRulesTooltip.percentages')}</Text>
                <Text size='xs'>{t('bid.split.syntaxRulesTooltip.even')}</Text>
                <Text size='xs'>{t('bid.split.syntaxRulesTooltip.fastIds')}</Text>
              </Stack>
            }
          >
            <Group gap={4} align='center'>
              <Text size='sm' c='dimmed'>
                {t('bid.split.syntaxRules')}
              </Text>
              <IconHelp size={16} className='text-[var(--mantine-color-dimmed)]' />
            </Group>
          </Tooltip>
        </Group>
      }
      size='xl'
      centered
    >
      <Stack gap='sm'>
        <div className='elevated-2 grid grid-cols-1 gap-3 rounded-lg bg-[var(--mantine-color-dark-6)] px-3 py-3 md:grid-cols-[minmax(0,1fr)_auto]'>
          <div className='min-w-0'>
            <Group gap='xs' wrap='nowrap'>
              <Text size='xs' c='dimmed' fw={700} className='shrink-0'>
                {t('bid.split.sourceBid')}
              </Text>
              <Text size='sm' fw={700} truncate className='min-w-0'>
                {bidName}
              </Text>
            </Group>
            <Group gap='xs' mt='xs'>
              <Button
                variant='subtle'
                size='compact-sm'
                color='primary.4'
                leftSection={<IconRefresh size={15} />}
                onClick={() => setEntries(distributeEvenly(entries, totalAmount))}
              >
                {t('bid.split.distributeEvenly')}
              </Button>
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
            <div className='border-paper-700 min-w-20 border-l px-4 text-left md:text-right'>
              <Text size='xs' c='dimmed'>
                {t('bid.split.allocatedLabel')}
              </Text>
              <Text size='sm' fw={700}>
                {allocatedAmount}
              </Text>
            </div>
            <div className='border-paper-700 min-w-20 border-l pl-4 text-left md:text-right'>
              <Text size='xs' c='dimmed'>
                {t('bid.split.remainingLabel')}
              </Text>
              <Text size='sm' fw={700} c={Math.abs(remainingAmount) < 0.01 ? 'green' : 'yellow'}>
                {remainingAmount}
              </Text>
            </div>
          </Group>
        </div>

        <SplitBidEntriesTable
          entries={entries}
          lots={lots}
          focusedPercentageEntryId={focusedPercentageEntryId}
          onFocusPercentageEntry={setFocusedPercentageEntryId}
          onUpdateEntry={updateEntry}
          onUpdateAmount={updateAmount}
          onUpdatePercentage={updatePercentage}
          onApplyPercentageSuggestion={applyPercentageSuggestion}
          onRemoveEntry={removeEntry}
        />

        <Group justify='space-between' align='center' className='border-paper-700 border-t pt-3'>
          <Button variant='outline' size='sm' leftSection={<IconPlus size={16} />} onClick={addEntry}>
            {t('bid.split.addEntry')}
          </Button>
          <Group gap='xs'>
            <Button variant='default' size='sm' onClick={onClose}>
              {t('bid.split.cancel')}
            </Button>
            <Tooltip label={submitDisabledReason} disabled={canSubmit} withArrow>
              <span>
                <Button size='sm' leftSection={<IconCheck size={16} />} onClick={handleSubmit} disabled={!canSubmit}>
                  {t('bid.split.apply')}
                </Button>
              </span>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SplitBidModal;
