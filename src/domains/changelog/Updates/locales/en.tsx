import { Link } from 'react-router-dom';
import { Space } from '@mantine/core';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';
import lockedPercentageGif from '@assets/img/locked-percentage-demo.gif';

export const ChangesEN: UpdateData[] = [
  {
    date: '2025-12-18T11:25:39.694Z',
    newFeatures: [
      <>
        <strong>Set exact lot percentage</strong> — Click on any lot's percentage (when "Show Winning Chances" is
        enabled) to set it to a specific value. Lot amount will be updated accordingly.
        <Space h='md' />
        <strong>Lock percentage</strong> — Click on the lock icon to enable locking. Lot amount will automatically adapt
        during the auction to keep percentage the same compared to other lots.
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
