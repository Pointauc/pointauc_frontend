import { FC } from 'react';
import { SimpleGrid } from '@mantine/core';

import { Overlay } from '../../../model/overlay.types';
import OverlayCard from '../OverlayCard/OverlayCard';
import NewOverlayCard from '../NewOverlayCard/NewOverlayCard';
import './OverlaysGrid.scss';

interface OverlaysGridProps {
  overlays: Overlay[];
  onEditOverlay: (overlay: Overlay) => void;
  onDeleteOverlay: (overlay: Overlay) => void;
  onCreateOverlay: () => void;
}

const OverlaysGrid: FC<OverlaysGridProps> = ({ overlays, onEditOverlay, onCreateOverlay, onDeleteOverlay }) => {
  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 2,
        md: 3,
        lg: 4,
      }}
      spacing='lg'
      className='overlays-grid'
    >
      {/* New Overlay Card - always first */}
      <NewOverlayCard onClick={onCreateOverlay} />

      {/* Existing Overlays */}
      {overlays.map((overlay) => (
        <OverlayCard key={overlay.id} overlay={overlay} onEdit={onEditOverlay} onDelete={onDeleteOverlay} />
      ))}
    </SimpleGrid>
  );
};

export default OverlaysGrid;
