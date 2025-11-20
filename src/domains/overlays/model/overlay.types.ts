import { AuctionOverlayDto, WheelOverlayDto } from '@api/openapi/types.gen';

export type OverlayType = 'Auction' | 'Wheel';

export type Overlay = AuctionOverlayDto | WheelOverlayDto;
