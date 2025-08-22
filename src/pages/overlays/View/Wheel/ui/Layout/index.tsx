import { FC } from 'react';

import { WheelItemWithMetadata } from '@models/wheel.model';
import { WheelOverlayDto } from '@api/openapi/types.gen';
import { WheelFormat } from '@constants/wheel';
import BaseWheel, { WheelController } from '@components/BaseWheel/BaseWheel';
import ItemsPreview from '@components/RandomWheel/ItemsPreview';
import WheelFlexboxAutosizer from '@components/BaseWheel/FlexboxAutosizer';

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
    <div className={`wheel-wrapper ${classes.wheelWrapper}`}>
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
    </div>
  );
};
