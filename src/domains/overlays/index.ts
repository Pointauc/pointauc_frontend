// Public API for overlays domain
export type { Overlay, OverlayType } from './model/overlay.types';

// Canvas utilities
export { CANVAS_RESOLUTIONS, detectDefaultResolution, findResolutionOption, buildTransform } from './lib/canvas';

// Link utilities
export { buildOverlayLink } from './lib/link';

// UI Components
export { default as OverlaysPage } from './ui/List/Page/OverlaysPage';
export { default as OverlayPage } from './ui/Edit/Page/OverlayPage';
export { default as OverlayViewPage } from './ui/View/Page/OverlayViewPage';
export { default as UrlControls } from './ui/UrlControls';

// Status Message Component
export { default as OverlayStatusMessage } from './ui/View/OverlayStatusMessage';

// Layout Components
export { default as AuctionLayout } from './Auction/ui/Layout/Layout';
export { WheelLayout } from './Wheel/ui/Layout';

// View Components
export { default as AuctionOverlayPage } from './Auction/ui/View';
export { default as WheelOverlayPage } from './Wheel/ui/View';
