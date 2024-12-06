const ENDPOINTS = {
  TWITCH_AUTH: '/api/twitch/auth',
  TWITCH_REWARDS: '/api/twitch/rewards',
  TWITCH_REDEMPTIONS: '/api/twitch/redemptions',
  TWITCH_REDEMPTIONS_BATCH: '/api/twitch/redemptions/batch',
  TWITCH_REWARD_PRESETS: '/api/twitch/settings/presets',
  DA_AUTH: '/api/da/auth',
  TWITCH_CHANNEL_POINTS: '/api/twitch/channelPoints',
  CAMILLE_BOT: '/api/requests/camilleBot',
  DONATE_PAY: {
    AUTH: '/api/donatePay/auth',
    TOKEN: 'https://donatepay.ru/api/v2/socket/token',
  },
  USER: {
    USERNAME: '/api/username',
    AUC_SETTINGS: '/api/aucSettings',
    SETTINGS: '/api/user/settings',
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
  EMOTES: {
    SEVEN_TV: 'https://7tv.io/v3/users/twitch',
  },
  PUBLIC_API: {
    TOKEN: '/api/oshino/token',
  },
  AUKUS: {
    RESULT: 'https://aukus.fun/api/point_auc/result',
    TIMER_STARTED: 'https://aukus.fun/api/point_auc/timer_started',
  },
};

export default ENDPOINTS;
