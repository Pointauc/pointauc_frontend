import React from 'react';
import { Dialog, DialogContent } from '@mui/material';

import BidsManagementConfirmation, {
  BidsManagementConfirmationProps,
} from '@components/BidsManagementConfirmation/index.tsx';

interface Props extends BidsManagementConfirmationProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode | null;
}

const BidsManagementDialog = ({ open, onClose, children, ...props }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth='md' fullWidth>
      {children}
      <DialogContent>
        <BidsManagementConfirmation {...props} onLoadingChanged={setIsLoading} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default BidsManagementDialog;
