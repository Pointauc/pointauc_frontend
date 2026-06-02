import { Badge, Group, Popover, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { getSuggestedLot } from './splitBidSuggestions';

import type { Lot } from '@models/slot.model';
import type { SplitBidDraftTarget } from './splitBidTypes';

type LotOption =
  | { type: 'new'; name: string }
  | { type: 'suggested'; lot: Lot; rating: number }
  | { type: 'existing'; lot: Lot };

interface LotSearchInputProps {
  value: string;
  lots: Lot[];
  onChange: (value: string) => void;
  onSelect: (target: SplitBidDraftTarget, inputValue: string) => void;
}

const OPTION_HEIGHT = 48;
const DROPDOWN_HEIGHT = 288;

const getLotName = (lot: Lot): string => String(lot.name || '');

const LotSearchInput = ({ value, lots, onChange, onSelect }: LotSearchInputProps) => {
  const { t } = useTranslation();
  const [isOpened, setIsOpened] = useState(false);

  const options = useMemo<LotOption[]>(() => {
    const normalizedValue = value.trim().toLowerCase();
    const suggestedLot = getSuggestedLot(value, lots);
    const matchingLots = lots.filter((lot) => {
      const lotName = getLotName(lot).toLowerCase();

      return (!normalizedValue || lotName.includes(normalizedValue)) && lot.id !== suggestedLot?.lot.id;
    });

    return [
      { type: 'new', name: value.trim() },
      ...(suggestedLot ? [{ type: 'suggested' as const, lot: suggestedLot.lot, rating: suggestedLot.rating }] : []),
      ...matchingLots.map((lot) => ({ type: 'existing' as const, lot })),
    ];
  }, [lots, value]);

  const selectOption = (option: LotOption): void => {
    if (option.type === 'new') {
      const name = option.name || value.trim();
      onSelect({ type: 'new', name }, name);
    } else {
      onSelect({ type: 'existing', lotId: option.lot.id, name: option.lot.name }, getLotName(option.lot));
    }

    setIsOpened(false);
  };

  const renderOption = ({ index, style }: ListChildComponentProps) => {
    const option = options[index];
    const lot = option.type === 'new' ? null : option.lot;
    const label = option.type === 'new' ? t('bid.split.newLotOption', { name: option.name }) : getLotName(option.lot);

    return (
      <UnstyledButton
        style={style}
        className='hover:bg-paper-transparent-100 flex w-full items-center justify-between px-3 py-2 text-left'
        onMouseDown={(event) => {
          event.preventDefault();
          selectOption(option);
        }}
      >
        <div className='min-w-0'>
          <Text size='sm' truncate>
            {label}
          </Text>
          {lot && (
            <Text size='xs' c='dimmed'>
              {t('bid.split.currentLotAmount', { amount: lot.amount ?? 0 })}
            </Text>
          )}
        </div>
        {option.type === 'suggested' && (
          <Badge size='xs' variant='light'>
            {t('bid.split.suggestedBadge')}
          </Badge>
        )}
        {option.type === 'new' && (
          <Badge size='xs' color='green' variant='light'>
            {t('bid.split.createBadge')}
          </Badge>
        )}
      </UnstyledButton>
    );
  };

  return (
    <Popover opened={isOpened} onChange={setIsOpened} position='bottom-start' width='target' shadow='md' withinPortal>
      <Popover.Target>
        <TextInput
          size='sm'
          value={value}
          placeholder={t('bid.split.lotPlaceholder')}
          onFocus={() => setIsOpened(true)}
          onClick={() => setIsOpened(true)}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            onChange(nextValue);
            setIsOpened(true);
          }}
        />
      </Popover.Target>
      <Popover.Dropdown p={0} className='overflow-hidden'>
        <Group gap={0} className='border-paper-400 border-b px-3 py-2'>
          <Text size='xs' c='dimmed'>
            {t('bid.split.lotSearchHint')}
          </Text>
        </Group>
        <FixedSizeList
          height={Math.min(DROPDOWN_HEIGHT, Math.max(options.length, 1) * OPTION_HEIGHT)}
          itemCount={options.length}
          itemSize={OPTION_HEIGHT}
          width='100%'
        >
          {renderOption}
        </FixedSizeList>
      </Popover.Dropdown>
    </Popover>
  );
};

export default LotSearchInput;
