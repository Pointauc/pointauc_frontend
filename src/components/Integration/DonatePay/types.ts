export type DonatePayRegion = 'ru' | 'eu';

export interface DonatePayRegionConfig {
  region: DonatePayRegion;
  integrationId: Integration.ID;
  centrifugeUrl: string;
  subscribeEndpoint: string;
  getChannel: (userId: string) => string;
}

export const DONATE_PAY_REGIONS: Record<DonatePayRegion, DonatePayRegionConfig> = {
  ru: {
    region: 'ru',
    integrationId: 'donatePay',
    centrifugeUrl: 'wss://centrifugo.donatepay.ru:443/connection/websocket',
    subscribeEndpoint: 'https://donatepay.ru/api/v2/socket/token',
    getChannel: (userId) => `$public:${userId}`,
  },
  eu: {
    region: 'eu',
    integrationId: 'donatePayEu',
    centrifugeUrl: 'wss://centrifugo.donatepay.eu:443/connection/websocket',
    subscribeEndpoint: 'https://donatepay.eu/api/v2/socket/token',
    getChannel: (userId) => `$public:${userId}`,
  },
};

