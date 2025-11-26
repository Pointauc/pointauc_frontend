import { useState } from 'react';
import { Modal } from '@mantine/core';

import BidsManagementConfirmation, {
  BidsManagementConfirmationProps,
} from '@components/BidsManagementConfirmation/index.tsx';

interface Props extends BidsManagementConfirmationProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode | null;
}

function BidsManagementDialog({ open, onClose, children, ...props }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal opened={open} onClose={isLoading ? () => {} : onClose} size='55rem' centered>
      {children}
      <BidsManagementConfirmation {...props} onLoadingChanged={setIsLoading} onClose={onClose} />
    </Modal>
  );
}

export default BidsManagementDialog;
