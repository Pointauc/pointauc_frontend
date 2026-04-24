export const analyticsEventNames = {
  appBootstrapped: 'app_bootstrapped',
  routeVisited: 'route_visited',
  auctionLotCreated: 'auction_lot_created',
  overlayOpened: 'overlay_opened',
  settingsSaved: 'settings_saved',
  wheelSpinResult: 'wheel_spin_result',
} as const;

/**
 * Keep analytics payloads lightweight: primitives only, no participant lists and
 * no nested wheel settings objects.
 */
export interface WheelSpinResultPayload {
  format: 'default' | 'dropout' | 'battle-royale';
  dropoutVariant: 'classic' | 'new' | 'none';
  randomnessSource: 'local-basic' | 'random-org' | 'random-org-signed';
  configuredSpinTimeSeconds: number | null;
  actualSpinTimeSeconds: number;
  isRandomSpinEnabled: boolean;
  randomSpinMinSeconds: number | null;
  randomSpinMaxSeconds: number | null;
  split: number;
  wheelStyle: string | null;
  hasCoreImage: boolean;
  soundtrackEnabled: boolean;
  soundtrackSourceType: 'youtube' | 'file' | 'none';
  maxDepth: number | null;
  depthRestriction: number | null;
  totalParticipantCount: number;
  finalSpinParticipantCount: number;
  totalWeight: number;
  finalSpinWeight: number;
  minWeight: number;
  maxWeight: number;
  averageWeight: number;
  winnerId: string;
  winnerName: string;
  winnerWeight: number;
  winnerChancePercentTotal: number;
  winnerChancePercentFinalSpin: number;
}

export interface AnalyticsEventMap {
  [analyticsEventNames.appBootstrapped]: {
    source: 'main' | 'manual';
    hasProviders: boolean;
    providerCount: number;
  };
  [analyticsEventNames.routeVisited]: {
    route: string;
    source?: 'router' | 'manual';
  };
  [analyticsEventNames.auctionLotCreated]: {
    lotId?: string;
    slotIndex?: number;
    origin?: 'manual' | 'import' | 'unknown';
  };
  [analyticsEventNames.overlayOpened]: {
    overlayId?: string;
    overlayType?: string;
    source?: 'list' | 'direct-link' | 'unknown';
  };
  [analyticsEventNames.settingsSaved]: {
    section: 'auction' | 'integrations' | 'appearance' | 'general' | 'unknown';
    source?: 'manual' | 'autosave';
  };
  [analyticsEventNames.wheelSpinResult]: WheelSpinResultPayload;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
