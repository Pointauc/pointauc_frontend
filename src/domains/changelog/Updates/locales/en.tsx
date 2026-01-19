import { Link } from 'react-router-dom';
import { Anchor, Space } from '@mantine/core';

import { UpdateData } from '@domains/changelog/model/types';
import ROUTES from '@constants/routes.constants';
import overlayDemoGif from '@assets/img/overlay-demo-v1.gif';
import lockedPercentageGif from '@assets/img/locked-percentage-demo.gif';

export const ChangesEN: UpdateData[] = [
  {
    date: '2026-01-19T20:40:00.757Z',
    newFeatures: [
      <>
        <strong>⭐️ Pin Lots</strong>
        <Space h='sm' />
        <div>You can pin specific lots to keep them at the top of the list.</div>
        <Space h='xs' />
        <div style={{ paddingLeft: '16px' }}>
          <strong>How to use:</strong> Click the three dots on the right side of a lot → select "Pin" or "Unpin".
          Pinned lots are displayed with a star icon next to their number.
        </div>
      </>,
    ],
    contributors: ['ahaha_classic_']
  },
  {
    date: '2025-12-25T13:45:23.597Z',
    newFeatures: [
      <>
        <strong>🎵 Wheel Soundtrack</strong>
        <Space h='sm' />
        <div>You can set up music that will play during the wheel spin.</div>
        <Space h='xs' />
        <div style={{ paddingLeft: '16px' }}>
          <strong>How to use:</strong> Wheel Page → Click the note button right next to the spin time
        </div>
      </>,
    ],
  },
  {
    date: '2025-12-21T14:18:56.195Z',
    newFeatures: [
      <>
        <strong>Provably Fair Wheel Spins</strong>
        <Space h='sm' />
        <div>This new feature protects both the streamer and viewers from rigging results by anyone.</div>
        <Space h='sm' />
        <div>
          No longer need to trust the website or streamer - anyone can verify the result directly and get proof of
          fairness.
        </div>
        <Space h='sm' />
        <div style={{ paddingLeft: '16px' }}>
          <strong>How to enable:</strong> Open Wheel Page → Select "Random.org+ (verifiable)" from random generation
          method dropdown on the wheel page
        </div>
        <Space h='xs' />
        <div style={{ paddingLeft: '16px' }}>
          <Anchor
            component={Link}
            to={ROUTES.TICKET_VERIFICATION_INFO}
            style={{ color: '#228be6', textDecoration: 'underline' }}
          >
            Learn how to verify the result of the spin →
          </Anchor>
        </div>
      </>,
    ],
  },
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
