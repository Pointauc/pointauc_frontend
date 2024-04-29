import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Link } from '@mui/material';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';

import { getCookie } from './common.utils';

export interface UpdateData {
  date: string;
  newFeatures?: ReactNode[];
  improvements?: ReactNode[];
  fixes?: ReactNode[];
}

const updates: UpdateData[] = [
  {
    date: '2024-04-29T04:15:00.882Z',
    fixes: [
      <div>
        <p>Исправлена интеграция с DONATE PAY, теперь она должна работать у всех.</p>
        <p>Если у вас что-то не работает, то отправляйте баг-репорт по кнопке в нижней части экрана, разберемся.</p>
      </div>,
      'На таймере теперь отображаются часы помимо минут и секунд, если время превышает 1 час',
    ],
  },
  {
    date: '2024-04-26T14:30:00.092Z',
    improvements: [
      <div>
        <p>
          Обновлено колесо на ВЫБЫВАНИЕ. Теперь в нем гораздо больше интриги, а размеры секторов должны вызвать меньше
          вопросов.
        </p>
        <p>("классическое" колесо на выбывание работает правильно и все еще доступно на сайте)</p>
      </div>,
    ],
  },
  {
    date: '2024-04-23T14:05:00.834Z',
    improvements: ['Правила больше НЕ СКАЧУТ при наведении крусора, теперь надо нажать на них для редактирования'],
  },
  {
    date: '2024-04-23T09:30:34.826Z',
    improvements: ['Добавлена возможность изменения фона и размера правил'],
  },
  {
    date: '2024-04-22T12:45:21.046Z',
    newFeatures: [
      <>
        <div>
          <span>Добавлен редактор правил аукциона. Вы можете открыть его нажав на кнопку </span>
          <VerticalSplitIcon style={{ position: 'relative', top: 6 }} />
          <span> в нижней панеле.</span>
        </div>
        <p style={{ lineHeight: 1.5 }}>
          У вас может быть несколько правил, между которыми вы можете переключаться. Правила сохраняются в браузере во
          время редактирования.
        </p>
      </>,
    ],
  },
  {
    date: '2024-04-21T05:10:00.098Z',
    fixes: [
      'Исправлена ошибка, когда в аукцион попадали левые награды за баллы канала и, как в случае с sound alerts, влияли на работу сайта.',
    ],
  },
  {
    date: '2024-01-14T12:21:05.669Z',
    newFeatures: ['Загрузка списка лотов из XSLX файла.'],
  },
  {
    date: '2023-12-22T09:24:10.217Z',
    newFeatures: ['Добавлена настройка для скрытия стоимости лотов и ставок.'],
  },
  {
    date: '2023-12-03T09:34:21.786Z',
    newFeatures: ['На странице интеграций можно отключить автоматическое добавление ставок.'],
    improvements: [
      <>
        <span>API: </span>
        <span className='spoiler'>/lot/getAll изменен на /lots</span>
      </>,
      <>
        <span>API: </span>
        <span className='spoiler'>добавлен новый эндпоинт /bid/status</span>
      </>,
      <>
        <span>API: </span>
        <span className='spoiler'>новые параметры: POST /bid - insertStrategy, PUT /lot - amountChange</span>
      </>,
    ],
  },
  {
    date: '2023-12-01T09:42:45.373Z',
    newFeatures: [
      'Новая настройка таймера. Теперь можно автоматически прибавлять время только если на таймере меньше определенного количества минут.',
    ],
    improvements: [
      'Улучшена оптимизация сайта. Главная страница может работать без тормозов при любом количестве лотов (было протестировано 10000).',
    ],
    fixes: ['Иногда могла неправильно подсчитываться стоимость шара на шаровых аукционах.'],
  },
  {
    date: '2023-11-26T06:31:49.508Z',
    fixes: [
      'Исправлена ошибка из-за которой некоторые лоты, которые должны добавляться автоматически, вместо этого просто пропадали.',
    ],
  },
  {
    date: '2023-11-24',
    newFeatures: [
      'Добавлена форма для отправки ошибок на нижней панели главной страницы. Отправляем ошибочки, не стесняемся)',
      <div>
        <b>API: </b>
        <Link href='https://github.com/Pointauc/Pointauc.Api' target='_blank'>
          библиотека для c#
        </Link>{' '}
        by NowaruAlone
      </div>,
      <div>
        <b>API: </b>
        <Link href='https://github.com/sofrin/auc-discordbot' target='_blank'>
          discord-бот для заказов сабов
        </Link>{' '}
        by Sofrin
      </div>,
    ],
    improvements: ['Улучшен перевод на беларуский и английский языки.'],
    fixes: [
      'При загрузке прошлых лотов могли дублироваться их id, из-за чего нельзя было указывать короткий номер лота в донате.',
    ],
  },
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
