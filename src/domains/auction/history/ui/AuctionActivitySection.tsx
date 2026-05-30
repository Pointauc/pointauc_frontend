import { type HeatmapMode } from '../lib/statistics';

import HistoryHeatmap from './HistoryHeatmap';
import WeekdayActivity from './WeekdayActivity';

import type { AuctionHistoryAuction } from '../model/types';

interface AuctionActivitySectionProps {
  auctions: AuctionHistoryAuction[];
  endDate: string;
  heatmapMode: HeatmapMode;
  selectedDay: string | null;
  onHeatmapModeChange: (mode: HeatmapMode) => void;
  onDaySelect: (dayKey: string) => void;
}

const AuctionActivitySection = ({
  auctions,
  endDate,
  heatmapMode,
  selectedDay,
  onHeatmapModeChange,
  onDaySelect,
}: AuctionActivitySectionProps) => {
  return (
    <div className='grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_320px]'>
      <HistoryHeatmap
        auctions={auctions}
        endDate={endDate}
        heatmapMode={heatmapMode}
        selectedDay={selectedDay}
        onHeatmapModeChange={onHeatmapModeChange}
        onDaySelect={onDaySelect}
      />
      <WeekdayActivity auctions={auctions} />
    </div>
  );
};

export default AuctionActivitySection;
