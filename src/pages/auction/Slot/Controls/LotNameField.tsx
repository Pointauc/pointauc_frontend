import { Loader, TextInputProps, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { parseLotLink, type ParsedLotMarkdownLink } from '@domains/links/lib/lotNameLink';
import { RootState } from '@reducers';
import { setSlotName } from '@reducers/Slots/Slots.ts';

import LotLinkButton from './LotLinkButton';
import styles from './LotControls.module.css';

interface LotNameFieldProps {
  id: string;
  name: string | null;
  isLocked: boolean;
  onKeyPress: TextInputProps['onKeyPress'];
}

const MARKDOWN_LABEL_ESCAPED_CHARACTERS = new Set(['\\', '[', ']']);

const getLotNameDisplayValue = (rawName: string, markdownLink: ParsedLotMarkdownLink | null): string => {
  if (!markdownLink) {
    return rawName;
  }

  const prefix = rawName.slice(0, markdownLink.startIndex);
  const suffix = rawName.slice(markdownLink.endIndex);
  return `${prefix}${markdownLink.label}${suffix}`;
};

const mapDisplayCursorToRaw = (
  rawName: string,
  markdownLink: ParsedLotMarkdownLink | null,
  position: number,
): number => {
  if (!markdownLink) {
    return position;
  }

  const prefix = rawName.slice(0, markdownLink.startIndex);
  const displayLinkStartIndex = prefix.length;
  const displayLinkEndIndex = displayLinkStartIndex + markdownLink.label.length;
  const rawLabelStartIndex = markdownLink.startIndex + 1;
  const rawLengthOffset = markdownLink.rawMarkdown.length - markdownLink.label.length;
  const displayToRawLabelOffsets = new Array<number>(markdownLink.label.length + 1).fill(0);
  let displayOffset = 0;

  for (let rawOffset = 0; rawOffset < markdownLink.rawLabel.length; rawOffset += 1) {
    displayToRawLabelOffsets[displayOffset] = rawOffset;

    const nextCharacter = markdownLink.rawLabel[rawOffset + 1];
    if (markdownLink.rawLabel[rawOffset] === '\\' && MARKDOWN_LABEL_ESCAPED_CHARACTERS.has(nextCharacter)) {
      rawOffset += 1;
    }

    displayOffset += 1;
  }

  displayToRawLabelOffsets[displayOffset] = markdownLink.rawLabel.length;

  if (position < displayLinkStartIndex) {
    return position;
  }

  if (position <= displayLinkEndIndex) {
    const labelDisplayOffset = position - displayLinkStartIndex;
    return rawLabelStartIndex + (displayToRawLabelOffsets[labelDisplayOffset] ?? markdownLink.rawLabel.length);
  }

  return position + rawLengthOffset;
};

const LotNameField = ({ id, name, isLocked, onKeyPress }: LotNameFieldProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const lotLinkParsingStatus = useSelector((root: RootState) => root.lotLinkParsing.loadingByLotId[id] ?? null);
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

    return formattedLotName;
  }, [formattedLotName, isNameRawMode, markdownLotLink, rawName]);

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
      pendingNameCursorPosition.current = mapDisplayCursorToRaw(rawName, markdownLotLink, displayCursorPosition);
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
  const isLotLinkParsingLoading = lotLinkParsingStatus != null;
  const lotLinkParsingSourceName = lotLinkParsingStatus?.sourceName ?? null;

  return (
    <>
      <div className='flex h-full min-w-0 flex-1 items-stretch gap-1'>
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
