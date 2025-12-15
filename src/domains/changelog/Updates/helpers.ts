import dayjs from 'dayjs';

import { Language } from '@enums/language.enum';
import { UpdateData } from '@domains/changelog/model/types';
import { ChangesEN } from '@domains/changelog/Updates/locales/en';
import { ChangesRU } from '@domains/changelog/Updates/locales/ru';

const updates: Record<Language, UpdateData[] | null> = {
  [Language.EN]: ChangesEN,
  [Language.RU]: ChangesRU,
  [Language.BE]: null,
  [Language.UA]: null,
};

const getUpdatesFromDate = (updates: UpdateData[], from: string): UpdateData[] => {
  if (/\d\d\.\d\d\.\d\d\d\d/.test(from)) {
    const normalizedDate = dayjs(from, 'DD.MM.YYYY').format('YYYY-MM-DD');

    return getUpdatesFromDate(updates, normalizedDate);
  }

  const unseenChangelogEnd = updates.findIndex(({ date }) => {
    const dateInstance = dayjs(date);

    return dateInstance.isSame(from) || dateInstance.isBefore(from);
  });

  return unseenChangelogEnd > -1 ? updates.slice(0, unseenChangelogEnd) : updates;
};

export const getUpdates = (date: string, locale: Language): UpdateData[] => {
  return date === '' ? [] : getUpdatesFromDate(updates[locale] ?? ChangesEN, date);
};
