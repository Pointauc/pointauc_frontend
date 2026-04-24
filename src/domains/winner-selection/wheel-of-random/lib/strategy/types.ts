import { RefObject } from 'react';

import { WheelFormat } from '@constants/wheel.ts';

import { DropoutVariant } from '../../BaseWheel/DropoutVariant';

import type { WheelController } from '../../BaseWheel/BaseWheel';

export interface WheelResolverProps {
  format: WheelFormat;
  dropoutVariant: DropoutVariant;
  controller: RefObject<WheelController | null>;
  isTicketRevealed: boolean;
  resetTicket: () => void;
}
