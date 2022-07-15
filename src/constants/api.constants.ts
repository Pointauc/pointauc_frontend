const ENDPOINTS = {
  TWITCH_AUTH: '/api/twitch/auth',
  TWITCH_REWARDS: '/api/twitch/rewards',
  TWITCH_REDEMPTIONS: '/api/twitch/redemptions',
  DA_AUTH: '/api/da/auth',
  TWITCH_CHANNEL_POINTS: '/api/twitch/channelPoints',
  CAMILLE_BOT: '/api/requests/camilleBot',
  USER: {
    USERNAME: '/api/username',
    AUC_SETTINGS: '/api/aucSettings',
    SETTINGS: '/api/user/settings/auc',
    DATA: '/api/user',
    INTEGRATION: '/api/user/settings/integration',
    VALIDATE_INTEGRATIONS: '/api/user/integration/validate',
  },
  RESTORE_SETTINGS: {
    HAS_USER: '/api/oldUsers/hasUser',
    RESTORE_SETTINGS: '/api/oldUsers/restoreSettings',
  },
  RANDOM: {
    INTEGER: '/api/random/integer',
  },
  AUDIO_ROOM: {
    USER: '/api/audioRoom/user',
    PRESETS: '/api/audioRoom/presets',
  },
};

export default ENDPOINTS;
