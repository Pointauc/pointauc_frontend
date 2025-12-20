import dayjs from 'dayjs';
import { Stack, Title, Text } from '@mantine/core';

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

const extraUpdates: Record<Language, Omit<UpdateData, 'date'>[] | null> = {
  [Language.EN]: [
    {
      fixes: [<>Fixed an issue with dropout spin</>],
    },
  ],
  [Language.RU]: [
    {
      fixes: [
        <Stack gap='xs'>
          <Title order={5}>Исправлена ошибка с некорректным выбором победителя в колесе на выбывание</Title>
          <Text>Ошибка была на сайте ровно с 12:00 до 21:00 по МСК (UTC +3)</Text>
          <Text>Приношу извенения за неудобства, впредь будут приняты меры чтобы такого не повторилось.</Text>
        </Stack>,
      ],
    },
  ],
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
  if (date === '') return [];

  const lastVisitDate = dayjs(date);
  const now = dayjs('2025-12-20 14:00 +03:00');
  const today12 = now.startOf('day').hour(12);
  const today21 = now.startOf('day').hour(21);

  const shouldShowExtra =
    lastVisitDate.isSame(now, 'day') && lastVisitDate.isAfter(today12) && lastVisitDate.isBefore(today21);

  const baseUpdates = getUpdatesFromDate(updates[locale] ?? ChangesEN, date);

  if (shouldShowExtra && extraUpdates[locale]) {
    const todayDate = now.format('YYYY-MM-DD');
    const extra = extraUpdates[locale]!.map((update) => ({
      ...update,
      date: todayDate,
    }));
    return [...extra, ...baseUpdates];
  }

  return baseUpdates;
};
