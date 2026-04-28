import { Loader, TextInputProps, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { parseLotLink, type ParsedLotMarkdownLink } from '@domains/links/lib/lotNameLink';
import { setSlotName } from '@reducers/Slots/Slots.ts';

import { useLotLinkParsing } from './hooks/useLotLinkParsing';
import LotLinkButton from './LotLinkButton';
import styles from './LotControls.module.css';

interface LotNameDisplayValue {
  value: string;
  mapDisplayCursorToRaw: (position: number) => number;
}

interface LotNameFieldProps {
  id: string;
  name: string | null;
  isLocked: boolean;
  onKeyPress: TextInputProps['onKeyPress'];
}

const getLotNameDisplayValue = (rawName: string, markdownLink: ParsedLotMarkdownLink | null): LotNameDisplayValue => {
  if (!markdownLink) {
    return {
      value: rawName,
      mapDisplayCursorToRaw: (position) => position,
    };
  }

  const prefix = rawName.slice(0, markdownLink.startIndex);
  const suffix = rawName.slice(markdownLink.endIndex);
  const value = `${prefix}${markdownLink.label}${suffix}`;
  const displayLinkStartIndex = prefix.length;
  const displayLinkEndIndex = displayLinkStartIndex + markdownLink.label.length;
  const rawLabelStartIndex = markdownLink.startIndex + 1;
  const rawLengthOffset = markdownLink.rawMarkdown.length - markdownLink.label.length;

  return {
    value,
    mapDisplayCursorToRaw: (position) => {
      if (position < displayLinkStartIndex) {
        return position;
      }

      if (position <= displayLinkEndIndex) {
        return rawLabelStartIndex + position - displayLinkStartIndex;
      }

      return position + rawLengthOffset;
    },
  };
};

const LotNameField = ({ id, name, isLocked, onKeyPress }: LotNameFieldProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [currentName, setCurrentName] = useState(name);
  const [isNameRawMode, setIsNameRawMode] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pendingNameCursorPosition = useRef<number | null>(null);
  const lotLink = useMemo(() => parseLotLink(currentName), [currentName]);
  const markdownLotLink = lotLink?.markdownLink ?? null;
  const rawName = currentName ?? '';
  const formattedLotName = useMemo(() => getLotNameDisplayValue(rawName, markdownLotLink), [markdownLotLink, rawName]);
  const displayedLotName = useMemo(() => {
    if (!markdownLotLink || isNameRawMode) {
      return rawName;
    }

    return formattedLotName.value;
  }, [formattedLotName.value, isNameRawMode, markdownLotLink, rawName]);

  const handleNameBlur: TextInputProps['onBlur'] = (): void => {
    setIsNameRawMode(false);

    if (name === rawName) {
      return;
    }

    dispatch(setSlotName({ id, name: rawName }));
  };

  const handleNameChange: TextInputProps['onChange'] = (event): void => {
    setCurrentName(event.target.value);
  };

  const handleNameFocus: TextInputProps['onFocus'] = (event): void => {
    if (isNameRawMode) {
      return;
    }

    if (markdownLotLink) {
      const displayCursorPosition = event.currentTarget.selectionStart ?? displayedLotName.length;
      pendingNameCursorPosition.current = formattedLotName.mapDisplayCursorToRaw(displayCursorPosition);
    }

    setIsNameRawMode(true);
  };

  useLayoutEffect(() => {
    if (!isNameRawMode || pendingNameCursorPosition.current == null || !nameInputRef.current) {
      return;
    }

    const inputElement = nameInputRef.current;
    const safeCursorPosition = Math.min(pendingNameCursorPosition.current, inputElement.value.length);
    inputElement.setSelectionRange(safeCursorPosition, safeCursorPosition);
    pendingNameCursorPosition.current = null;
  }, [currentName, isNameRawMode]);

  useEffect(() => {
    if (name !== currentName) {
      setCurrentName(name);
      setIsNameRawMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  const { isLoading: isLotLinkParsingLoading, sourceName: lotLinkParsingSourceName } = useLotLinkParsing({
    id,
    name,
    setCurrentName,
    setIsNameRawMode,
  });

  return (
    <>
      <div className='flex h-full flex-1 items-stretch gap-1'>
        <input
          className={clsx(styles.input, 'min-w-0 flex-1 self-stretch', { [styles.lockedLot]: isLocked })}
          ref={nameInputRef}
          placeholder={t('auc.lotName')}
          onBlur={handleNameBlur}
          onChange={handleNameChange}
          onFocus={handleNameFocus}
          onKeyPress={onKeyPress}
          value={displayedLotName}
        />
        {isLotLinkParsingLoading ? (
          <Tooltip
            label={t('lot.loadingDataFromSource', {
              sourceName: lotLinkParsingSourceName ?? t('common.source'),
            })}
            withArrow
            openDelay={120}
          >
            <div className='flex h-full w-11 items-center justify-center' aria-label={t('common.loading')}>
              <Loader size='sm' />
            </div>
          </Tooltip>
        ) : (
          lotLink && <LotLinkButton href={lotLink.href} url={lotLink.url} />
        )}
      </div>
    </>
  );
};

export default LotNameField;
