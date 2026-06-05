import AuctionClearedActionCard from './cards/AuctionClearedActionCard';
import BidDeletedActionCard from './cards/BidDeletedActionCard';
import BidProcessedActionCard from './cards/BidProcessedActionCard';
import BidRedemptionStatusChangedActionCard from './cards/BidRedemptionStatusChangedActionCard';
import BidSplitActionCard from './cards/BidSplitActionCard';
import BidUpdatedActionCard from './cards/BidUpdatedActionCard';
import { ActionLogEntry } from './cards/entryTypes';
import LotAddedActionCard from './cards/LotAddedActionCard';
import LotDeletedActionCard from './cards/LotDeletedActionCard';
import LotPriceChangedActionCard from './cards/LotPriceChangedActionCard';
import LotRenamedActionCard from './cards/LotRenamedActionCard';
import LotsReplacedActionCard from './cards/LotsReplacedActionCard';
import UnknownActionCard from './cards/UnknownActionCard';

interface ActionLogEntryCardProps {
  entry: ActionLogEntry;
  isReverting: boolean;
  onRevert: (entryId: string) => void;
}

const ActionLogEntryCard = ({ entry, isReverting, onRevert }: ActionLogEntryCardProps) => {
  switch (entry.type) {
    case 'lot.renamed':
      return <LotRenamedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'lot.priceChanged':
      return <LotPriceChangedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'lot.added':
      return <LotAddedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'lot.deleted':
      return <LotDeletedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'lots.replaced':
      return <LotsReplacedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'auction.cleared':
      return <AuctionClearedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'bid.processed':
      return <BidProcessedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'bid.split':
      return <BidSplitActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'bid.deleted':
      return <BidDeletedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'bid.updated':
      return <BidUpdatedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    case 'bid.redemptionStatusChanged':
      return <BidRedemptionStatusChangedActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
    default:
      return <UnknownActionCard entry={entry} isReverting={isReverting} onRevert={onRevert} />;
  }
};

export default ActionLogEntryCard;
