import { FC } from 'react';

import { AuctionOverlayDto } from '@api/openapi/types.gen';
import { Slot } from '@models/slot.model';
import Layout from '@pages/overlays/View/Auction/ui/Layout/Layout';

interface AuctionOverlayPreviewProps {
  overlay: AuctionOverlayDto;
}

// Mock data for auction preview
const generateMockLots = (): Slot[] => {
  const lotNames = [
    'The Legend of Zelda: Breath of the Wild',
    'Red Dead Redemption 2',
    'The Witcher 3: Wild Hunt',
    'Cyberpunk 2077',
    'Minecraft',
    'Grand Theft Auto V',
    'Elden Ring',
    'God of War',
    'Super Mario Odyssey',
    'Hades',
    'Among Us',
    'Fall Guys',
    'Fortnite',
    'Call of Duty: Modern Warfare',
    'Overwatch 2',
    'Apex Legends',
    'Valorant',
    'Counter-Strike 2',
    'League of Legends',
    'Dota 2',
    'World of Warcraft',
    'Final Fantasy XIV',
    'Stardew Valley',
    'Animal Crossing: New Horizons',
    'The Elder Scrolls V: Skyrim',
  ];

  return lotNames
    .map((name, index) => ({
      id: `lot-${index + 1}`,
      name,
      amount: Math.floor(Math.random() * 1000) + 100,
      extra: 0,
      fastId: index + 1,
    }))
    .sort((a, b) => b.amount - a.amount);
};

const mockRules = `
1. Ставки принимаются в формате !bid [номер лота] [сумма]
2. Минимальная ставка: 100 поинтов
3. Шаг аукциона: 50 поинтов
4. Время на ставку: 30 секунд
5. После окончания аукциона победитель получает лот
6. Поинты снимаются автоматически после победы
`.trim();

const mockTimer = { state: 'paused' as const, timeLeft: 1000 * 60 * 5 }; // 5 minutes
const mockLots = generateMockLots();

const AuctionOverlayPreview: FC<AuctionOverlayPreviewProps> = ({ overlay }) => {
  return (
    <Layout
      lots={
        overlay.settings.showTable
          ? {
              items: mockLots,
              autoScroll: overlay.settings.autoscroll,
              scrollSpeed: overlay.settings.autoscrollSpeed,
            }
          : undefined
      }
      rules={overlay.settings.showRules ? { rules: mockRules } : undefined}
      timer={overlay.settings.showTimer ? mockTimer : undefined}
      darkAlpha={overlay.settings.backgroundTransparency / 100}
    />
  );
};

export default AuctionOverlayPreview;
