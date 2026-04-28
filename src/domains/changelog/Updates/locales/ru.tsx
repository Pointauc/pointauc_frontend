import { Link } from 'react-router-dom';
import { Anchor, Space } from '@mantine/core';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';
import lockedPercentageGif from '@assets/img/locked-percentage-demo.gif';

export const ChangesRU: UpdateData[] = [
  {
    date: '2026-04-28T15:45:00.000Z',
    newFeatures: [
      {
        briefDescription: 'Ссылки IMDb и Kinopoisk теперь заменяются на название фильма',
        content: (
          <>
            <strong>Ссылки IMDb и Kinopoisk</strong>
            <Space h='sm' />
            <div>
              Приложение теперь автоматически заменяет ссылки IMDb и Kinopoisk на более красивое название фильма.
              Оригинальная ссылка все еще прикреплена к лоту и вы можете увидеть ее при редактировании названия.
            </div>
          </>
        ),
      },
      {
        briefDescription: 'Быстрый переход по ссылкам в названии лота',
        content: (
          <>
            <strong>Ссылки в названии лота</strong>
            <Space h='sm' />
            <div>
              Если в названии лота есть ссылка, приложение теперь показывает кнопку, которая ведет на эту ссылку.
              Названия лотов также поддерживают Markdown-стиль ссылок, поэтому можно указать правильное название и URL.
            </div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Пример Markdown:</strong> <code>[Крестный отец](https://example.com)</code>
            </div>
            <Space h='xs' />
            <div>
              В этом случае приложение покажет только <strong>Крестный отец</strong>, а не полный URL.
            </div>
          </>
        ),
      },
      {
        briefDescription: 'Очередь ставок теперь сохраняется в архив',
        content: (
          <>
            <strong>Сохранение ставок в архив</strong>
            <Space h='sm' />
            <div>
              Приложение теперь может сохранять необработанные ставки в архивы. Ставки также автоматически сохраняются
              при обновлении страницы аукциона или при любом действии с таблицей.
            </div>
          </>
        ),
      },
    ],
  },
  {
    date: '2026-04-26T06:00:00.880Z',
    newFeatures: [
      {
        briefDescription: 'Горячие клавиши для многих действий',
        content: (
          <>
            <strong>Горячие клавиши</strong>
            <Space h='sm' />
            <div>
              Добавлены горячие клавиши для управления таймером аукциона, ставкам, интеграциям, навигации по страницам и
              вращению колеса.
            </div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Совет:</strong> Удерживайте <strong>Alt</strong>, чтобы показать подсказки по горячим клавишам.
            </div>
          </>
        ),
      },
      {
        briefDescription: 'Редактируемый таймер',
        content: (
          <>
            <strong>⏱️ Редактируемый таймер</strong>
            <Space h='sm' />
            <div>Теперь вы можете редактировать таймер с помощью клавиатуры.</div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Как использовать:</strong> Нажмите на таймер, чтобы перейти в режим редактирования. Введите новое
              значение и нажмите Enter или кликните вне поля, чтобы сохранить изменения.
            </div>
          </>
        ),
      },
      {
        briefDescription: 'Новый фон',
        content: (
          <>
            <strong>🎨 Новый фон</strong>
            <Space h='sm' />
            <div>Новый процедурно генерируемый фон доступен на странице настроек.</div>
          </>
        ),
      },
    ],
  },
  {
    date: '2026-01-19T20:50:00.757Z',
    newFeatures: [
      {
        content: (
          <>
            <strong>⭐️ Закрепление лотов</strong>
            <Space h='sm' />
            <div>Вы можете закреплять некоторые лоты для отображения их сверху списка.</div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Как использовать:</strong> Нажмите на три точки справа от лота → выберите "Закрепить" или
              "Открепить". Закрепленные лоты отображаются со звездочкой слева от номера.
            </div>
          </>
        ),
      },
    ],
    contributors: ['ahaha_classic_'],
  },
  {
    date: '2025-12-25T13:45:23.597Z',
    newFeatures: [
      {
        content: (
          <>
            <strong>🎵 Саундтрек для колеса</strong>
            <Space h='sm' />
            <div>Вы можете настроить музыку, которая будет проигрываться при вращении колеса.</div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Как использовать:</strong> Страница колеса → Нажмите кнопку с нотой справа от времени прокрута
            </div>
          </>
        ),
      },
    ],
  },
  {
    date: '2025-12-21T14:18:56.195Z',
    newFeatures: [
      {
        content: (
          <>
            <strong>Доказуемо честное вращение колеса</strong>
            <Space h='sm' />
            <div>Эта новая функция защищает как стримера так и зрителя от подтасовки результатов кем либо.</div>
            <Space h='xs' />
            <div>
              Больше не не нужно доверять честности сайта или стримера - любой человек может проверить результат
              прокрута колеса напрямую и получить доказательство непредвзятости.
            </div>
            <Space h='sm' />
            <div style={{ paddingLeft: '16px' }}>
              <strong>Как включить:</strong> Откройте страницу колеса → Выберите "Random.org+ (цифровая подпись)" в
              выпадающем списке метода генерации случайных чисел
            </div>
            <Space h='xs' />
            <div style={{ paddingLeft: '16px' }}>
              <Anchor
                component={Link}
                to={ROUTES.TICKET_VERIFICATION_INFO}
                style={{ color: '#228be6', textDecoration: 'underline' }}
              >
                Узнайте, как проверить результат вращения →
              </Anchor>
            </div>
          </>
        ),
      },
    ],
  },
  {
    date: '2025-12-18T11:25:39.694Z',
    newFeatures: [
      {
        content: (
          <>
            <strong>Установка точного процента лота</strong> — Нажмите на значение процента рядом с любым лотом (когда
            "Показывать шансы на победу" включен) для установки его точного значения. Сумма лота обновится под новый
            процент.
            <Space h='md' />
            <strong>Фиксация процента</strong> — Нажмите на иконку замка, чтобы зафиксировать процент. Сумма лота будет
            автоматически обновляться при изменении других лотов.
            <Space h='md' />
            <div>
              <img
                src={lockedPercentageGif}
                alt='Locked percentage'
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #373A40' }}
              />
            </div>
          </>
        ),
      },
    ],
  },
  {
    date: '2025-12-17T19:39:09.850Z',
    newFeatures: [
      {
        content: (
          <>
            <strong>Оверлеи</strong> — Новая большая функция, которая позволяет отображать ваш аукцион или колесо прямо
            на стриме с прозрачным фоном.{' '}
            <Link to={ROUTES.OVERLAYS} style={{ color: '#228be6', textDecoration: 'underline' }}>
              Открыть страницу оверлеев
            </Link>
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <img
                src={overlayDemoGif}
                alt='Демо оверлея'
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #373A40' }}
              />
            </div>
          </>
        ),
      },
    ],
    fixes: [
      {
        content: <>Исправлена проблема, когда донаты с пустым текстом могли сломать страницу.</>,
      },
    ],
  },
];
