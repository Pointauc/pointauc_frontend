import { useInitializeUser } from '@domains/bids/lib/useInitializeUser';
import { DesktopSyncExportView } from '@domains/desktop/ui/DesktopSyncExportView/DesktopSyncExportView';

const DesktopSyncPage = () => {
  useInitializeUser();

  return <DesktopSyncExportView />;
};

export default DesktopSyncPage;
