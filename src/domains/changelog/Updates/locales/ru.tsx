import { Link } from 'react-router-dom';
import { Anchor, Space } from '@mantine/core';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';
import lockedPercentageGif from '@assets/img/locked-percentage-demo.gif';

export const ChangesRU: UpdateData[] = [
  {
    date: '2025-12-21T14:18:56.195Z',
    newFeatures: [
      <>
        <strong>Доказуемо честное вращение колеса</strong>
        <Space h='sm' />
        <div>Эта новая функция защищает как стримера так и зрителя от подтасовки результатов кем либо.</div>
        <Space h='xs' />
        <div>
          Больше не нужно доверять честности сайта или стримера - любой человек может проверить результат прокрута
          колеса напрямую и получить доказательство непредвзятости.
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
      </>,
    ],
  },
  {
    date: '2025-12-18T11:25:39.694Z',
    newFeatures: [
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
      </>,
    ],
  },
  {
    date: '2025-12-17T19:39:09.850Z',
    newFeatures: [
      <>
        <strong>Оверлеи</strong> — Новая большая функция, которая позволяет отображать ваш аукцион или колесо прямо на
        стриме с прозрачным фоном.{' '}
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
      </>,
    ],
    fixes: [<>Исправлена проблема, когда донаты с пустым текстом могли сломать страницу.</>],
  },
];
