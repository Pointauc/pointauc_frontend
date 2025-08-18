import { AuctionOverlayDto, WheelOverlayDto } from '@api/openapi/types.gen';

export type OverlayType = 'Auction' | 'Wheel';

export interface BaseOverlay {
  id: string;
  name: string;
  type: OverlayType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionOverlaySettings {
  showRules: boolean;
  showTable: boolean;
  showTimer: boolean;
  backgroundTransparency: number;
  autoscroll: boolean;
  autoscrollSpeed: number;
}

export interface WheelOverlaySettings {
  showWheel: boolean;
  showParticipants: boolean;
  backgroundTransparency: number;
}

export interface AuctionOverlay extends BaseOverlay {
  type: 'Auction';
  settings: AuctionOverlaySettings;
}

export interface WheelOverlay extends BaseOverlay {
  type: 'Wheel';
  settings: WheelOverlaySettings;
}

export type Overlay = AuctionOverlayDto | WheelOverlayDto;
