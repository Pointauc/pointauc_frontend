import { FC, useMemo, useRef } from 'react';

import { WheelOverlayDto } from '@api/openapi/types.gen';
import { WheelItemWithMetadata } from '@models/wheel.model';
import { WheelFormat } from '@constants/wheel';
import { WheelController } from '@components/BaseWheel/BaseWheel';
import { WheelLayout } from '@pages/overlays/View/Wheel/ui/Layout';

interface WheelOverlayPreviewProps {
  overlay: WheelOverlayDto;
}

// Mock data for wheel preview
const generateMockParticipants = (count: number = 12): WheelItemWithMetadata[] => {
  const participantNames = [
    'StreamerBoy123',
    'GamerGirl456',
    'ProPlayer789',
    'NoobMaster69',
    'EliteGamer',
    'CasualPlayer',
    'SpeedRunner',
    'RetroGamer',
    'ModernGamer',
    'ClassicFan',
    'NewbieFriend',
    'VeteranPlayer',
  ];

  const colors = [
    '#c3747f',
    '#ea5461',
    '#b87dc8',
    '#978fbc',
    '#5d60e2',
    '#e58221',
    '#e35182',
    '#36b5e9',
    '#355f56',
    '#63c575',
    '#519cc0',
    '#EA631D',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `participant-${index + 1}`,
    name: participantNames[index % participantNames.length],
    color: colors[index % colors.length],
    amount: Math.floor(Math.random() * 500) + 100,
    originalAmount: Math.floor(Math.random() * 500) + 100,
  }));
};
const mockParticipants = generateMockParticipants();
const mockFormat = WheelFormat.Default;

const WheelOverlayPreview: FC<WheelOverlayPreviewProps> = ({ overlay }) => {
  const wheelRef = useRef<WheelController | null>(null);
  const mockCoreImage = useMemo(() => localStorage.getItem('wheelEmote') ?? undefined, []);

  return (
    <WheelLayout
      overlay={overlay}
      participants={mockParticipants}
      format={mockFormat}
      coreImage={mockCoreImage}
      wheelRef={wheelRef}
    />
  );
};

export default WheelOverlayPreview;
