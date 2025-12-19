import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { AuctionOverlayDto } from '@api/openapi/types.gen';
import { Slot } from '@models/slot.model';
import { buildDefaultRule } from '@pages/auction/Rules/helpers';
import { rulesActiveApi, rulesQueryKeys } from '@domains/auction/rules';
import { RootState } from '@reducers/index';

import Layout from '../Layout/Layout';

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

const mockTimer = { state: 'paused' as const, timeLeft: 1000 * 60 * 5 }; // 5 minutes
const mockLots = generateMockLots();

const AuctionOverlayPreview: FC<AuctionOverlayPreviewProps> = ({ overlay }) => {
  const { t } = useTranslation();
  const activeRuleId = useSelector((state: RootState) => state.aucSettings.settings.activeRuleId);

  // Fetch active rule
  const { data: activeRule } = useQuery({
    queryKey: rulesQueryKeys.rule(activeRuleId),
    queryFn: () => rulesActiveApi.getById(activeRuleId!),
    enabled: !!activeRuleId,
  });

  // Fetch all rules as fallback
  const { data: allRules = [] } = useQuery({
    queryKey: rulesQueryKeys.all,
    queryFn: () => rulesActiveApi.getAll(),
    enabled: !activeRuleId || !activeRule,
  });

  const mockRules = useMemo<string>(() => {
    // Priority 1: Use active rule if available
    if (activeRule) {
      return activeRule.data;
    }

    // Priority 2: Use first available rule
    if (allRules.length > 0) {
      return allRules[0].data;
    }

    // Priority 3: Use default rule
    const defaultRule = buildDefaultRule(t);
    return JSON.stringify(defaultRule.content);
  }, [activeRule, allRules, t]);

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
      transparency={overlay.settings.backgroundTransparency}
    />
  );
};

export default AuctionOverlayPreview;
