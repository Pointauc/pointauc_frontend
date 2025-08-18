import { Overlay, AuctionOverlay, WheelOverlay } from '../types/overlay.types';

/**
 * Generates a random URL pathname for an overlay
 */
export const generateRandomPathname = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Creates mock overlay data for development/testing
 */
export const createMockOverlays = (): Overlay[] => {
  const now = new Date();

  const auctionOverlay: AuctionOverlay = {
    id: '1',
    name: 'Game Selection Auction',
    type: 'Auction',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    settings: {
      showTimer: true,
      showTable: true,
      showRules: true,
      backgroundTransparency: 100,
      autoscroll: false,
      autoscrollSpeed: 50,
    },
  };

  const wheelOverlay: WheelOverlay = {
    id: '2',
    name: 'Random Winner Wheel',
    type: 'Wheel',
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    settings: {
      showWheel: true,
      showParticipants: true,
      backgroundTransparency: 100,
    },
  };

  const auctionOverlay2: AuctionOverlay = {
    id: '3',
    name: 'Movie Night Vote',
    type: 'Auction',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    settings: {
      showTimer: false,
      showTable: true,
      showRules: true,
      backgroundTransparency: 100,
      autoscroll: false,
      autoscrollSpeed: 50,
    },
  };

  return [auctionOverlay, wheelOverlay, auctionOverlay2];
};
