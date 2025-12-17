import { Link } from 'react-router-dom';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';

export const ChangesRU: UpdateData[] = [
  {
    date: '2025-12-17T19:35:09.850Z',
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
