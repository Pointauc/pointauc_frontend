import { Link } from 'react-router-dom';
import { Space } from '@mantine/core';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';
import lockedPercentageGif from '@assets/img/locked-percentage-demo.gif';

export const ChangesRU: UpdateData[] = [
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
