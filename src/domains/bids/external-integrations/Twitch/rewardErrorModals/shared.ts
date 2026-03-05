export const getDashboardUrl = (twitchUsername?: string): string =>
  twitchUsername
    ? `https://dashboard.twitch.tv/u/${twitchUsername}/viewer-rewards/channel-points/rewards`
    : 'https://dashboard.twitch.tv/viewer-rewards/channel-points/rewards';
