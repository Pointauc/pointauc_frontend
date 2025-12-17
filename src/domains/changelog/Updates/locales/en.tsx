import { Link } from 'react-router-dom';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';

export const ChangesEN: UpdateData[] = [
  {
    date: '2025-12-17T19:35:09.850Z',
    newFeatures: [
      <>
        <strong>Overlays</strong> — A new major feature that allows you to display your auction or wheel directly on
        stream with a transparent background.{' '}
        <Link to={ROUTES.OVERLAYS} style={{ color: '#228be6', textDecoration: 'underline' }}>
          Open Overlays page
        </Link>{' '}
        to get started.
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <img
            src={overlayDemoGif}
            alt='Overlay demo'
            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #373A40' }}
          />
        </div>
      </>,
    ],
    fixes: [<>Fixed an issue where donations with empty text could break the page.</>],
  },
];
