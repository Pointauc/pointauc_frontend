import dayjs from 'dayjs';
import { getCookie } from './common.utils';

export interface UpdateData {
  date: string;
  newFeatures: string[];
  improvements: string[];
  fixes: string[];
}

const updates: UpdateData[] = [
  {
    date: '25.10.2023',
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
  const unseenChangelogStart = updates.findIndex(({ date }) => dayjs(from).isBefore(date));

  return unseenChangelogStart > -1 ? updates.slice(unseenChangelogStart) : [];
};

export const getUpdates = (): UpdateData[] => {
  const from = getCookie('lastVisit');

  return from === '' ? updates : getUpdatesFromDate(from);
};
