import { FC } from 'react';

import { WheelOverlayDto } from '@api/openapi/types.gen';
import BaseWheel, { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import WheelFlexboxAutosizer from '@domains/winner-selection/wheel-of-random/BaseWheel/FlexboxAutosizer';
import ItemsPreview from '@domains/winner-selection/wheel-of-random/ui/ItemsPreview';
import { WheelFormat } from '@constants/wheel';
import { WheelItemWithMetadata } from '@models/wheel.model';
import OverlayThemeScope from '@shared/mantine/OverlayThemeScope';

import classes from './index.module.css';

interface WheelLayoutProps {
  overlay: WheelOverlayDto;
  participants: WheelItemWithMetadata[];
  format: WheelFormat;
  coreImage: string | undefined;
  wheelRef: React.RefObject<WheelController>;
}

export const WheelLayout: FC<WheelLayoutProps> = ({ overlay, participants, format, coreImage, wheelRef }) => {
  return (
    <OverlayThemeScope
      className={`wheel-wrapper ${classes.wheelWrapper}`}
      backgroundTransparency={overlay.settings.backgroundTransparency}
    >
      {overlay.settings.showParticipants && (
        <ItemsPreview
          allItems={participants}
          activeItems={participants}
          format={format}
          className={classes.itemsPreview}
          showControls={false}
          centerItems
        />
      )}
      {overlay.settings.showWheel && (
        <WheelFlexboxAutosizer>
          {({ onOptimalSizeChange }) => (
            <BaseWheel
              items={participants}
              controller={wheelRef}
              dropOut={format === WheelFormat.Dropout}
              coreImage={coreImage}
              onOptimalSizeChange={onOptimalSizeChange}
            />
          )}
        </WheelFlexboxAutosizer>
      )}
    </OverlayThemeScope>
  );
};
