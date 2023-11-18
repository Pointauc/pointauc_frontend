import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Link } from '@mui/material';

import { getCookie } from './common.utils';

export interface UpdateData {
  date: string;
  newFeatures?: ReactNode[];
  improvements?: string[];
  fixes?: string[];
}

const updates: UpdateData[] = [
  {
    date: '2023-11-18',
    newFeatures: [
      <div>
        Добавлено публичное АПИ аукциона, с ним вы можете программно отправлять ставки на сайт через сторонних ботов.
        Документацию можно найти по этой{' '}
        <Link href='https://app.theneo.io/bf08f5b1-1025-4a83-8518-14458df03592/pointauc/api-reference' target='_blank'>
          ссылке
        </Link>
      </div>,
    ],
  },
  {
    date: '2023-11-12',
    newFeatures: [
      'Добавлены настройки внешнего вида, там можно частично изменить цветовую палитру, которая используетя на сайте.',
    ],
    improvements: [
      'При открытии сайта автоматически загружаются лоты из вашей последней сессии.',
      'На сайт переодически проводятся DDOS атаки, я постепенно улучшаю защиту от них, но чтобы полностью устранить их влияние понадобится больше времени.',
      'Обновлены версии почти всех сторонних библиотек.',
      'Улучшены некоторые элементы интерфейса.',
    ],
  },
  {
    date: '2023-10-15',
    newFeatures: [
      'Добавлена поддержка сервиса DonatePay.',
      'Карточку со ставкой теперь можно добавить к случайному лоту.',
    ],
    improvements: [
      'Именения в настройках теперь сохраняются сразу при редактировании без необходимости нажатия кнопки "сохранить".',
      'Значительно ускорена загрузка аккаунта.',
    ],
    fixes: [
      'Добавление времени при донате не работало корректно.',
      'В колесе не отображались стандартные смайлы.',
      'Разделение лотов не работало с колесом на выбывание. Теперь опцию разделения нельзя случайно выбрать при выбывании.',
    ],
  },
];

const getUpdatesFromDate = (from: string): UpdateData[] => {
  if (/\d\d\.\d\d\.\d\d\d\d/.test(from)) {
    const normalizedDate = dayjs(from, 'DD.MM.YYYY').format('YYYY-MM-DD');

    return getUpdatesFromDate(normalizedDate);
  }

  const unseenChangelogEnd = updates.findIndex(({ date }) => {
    const dateInstance = dayjs(date);

    return dateInstance.isSame(from) || dateInstance.isBefore(from);
  });

  return unseenChangelogEnd > -1 ? updates.slice(0, unseenChangelogEnd) : updates;
};

export const getUpdates = (): UpdateData[] => {
  const from = getCookie('lastVisit');

  return from === '' ? updates : getUpdatesFromDate(from);
};
