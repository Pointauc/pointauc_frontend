export const analyticsEventNames = {
  appBootstrapped: 'app_bootstrapped',
  routeVisited: 'route_visited',
  auctionLotCreated: 'auction_lot_created',
  auctionEnded: 'auction_ended',
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
  dropout_variant: 'classic' | 'new' | 'none';
  randomness_source: 'local-basic' | 'random-org' | 'random-org-signed';
  configured_spin_time_seconds: number | null;
  actual_spin_time_seconds: number;
  is_random_spin_enabled: boolean;
  random_spin_min_seconds: number | null;
  random_spin_max_seconds: number | null;
  split: number;
  wheel_style: string | null;
  has_core_image: boolean;
  soundtrack_enabled: boolean;
  soundtrack_source_type: 'youtube' | 'file' | 'none';
  max_depth: number | null;
  depth_restriction: number | null;
  total_participant_count: number;
  final_spin_participant_count: number;
  total_weight: number;
  final_spin_weight: number;
  min_weight: number;
  max_weight: number;
  average_weight: number;
  winner_weight: number;
  winner_chance_percent_total: number;
  winner_chance_percent_final_spin: number;
}

export interface AnalyticsEventMap {
  [analyticsEventNames.appBootstrapped]: {
    source: 'main' | 'manual';
    has_providers: boolean;
    provider_count: number;
  };
  [analyticsEventNames.routeVisited]: {
    route_path: string;
    source?: 'router' | 'manual';
  };
  [analyticsEventNames.auctionLotCreated]: {
    lot_id?: string;
    slot_index?: number;
    origin?: 'manual' | 'import' | 'unknown';
  };
  [analyticsEventNames.auctionEnded]: {
    timer_start_minutes: number;
    is_donation_autoincrement_active: boolean;
    is_new_slot_increment_active: boolean;
    is_leader_change_increment_active: boolean;
    is_min_time_active: boolean;
    is_max_time_active: boolean;
    is_show_chances: boolean;
    is_show_total_time: boolean;
    is_hide_amounts: boolean;
    insert_strategy: string;
    bid_name_strategy: string;
    background_type: string;
    background_overlay_opacity: number;
    background_blur: number;
    is_geometry_background_color_enabled: boolean;
    is_custom_primary_color: boolean;
    purchase_sort: string;
    is_marbles_auc_enabled: boolean;
    is_max_time_enabled: boolean;
    is_lucky_wheel_enabled: boolean;
    lot_count: number;
    total_amount: number;
    max_amount: number;
    average_amount: number;
    has_favorites: boolean;
    has_locked_percentage: boolean;
  };
  [analyticsEventNames.overlayOpened]: {
    overlay_id?: string;
    overlay_type?: string;
    source?: 'list' | 'direct-link' | 'unknown';
  };
  [analyticsEventNames.settingsSaved]: {
    section: 'auction' | 'integrations' | 'appearance' | 'general' | 'unknown';
    source?: 'manual' | 'autosave';
  };
  [analyticsEventNames.wheelSpinResult]: WheelSpinResultPayload;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
