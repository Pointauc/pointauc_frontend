import { useState } from 'react';
import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton';
import * as Integration from '@models/integration';
import DonliAuthModal from './AuthModal';

interface DonliLoginButtonProps extends Integration.LoginButtonProps {
  clientId?: string;
  redirectUri: string;
}

export const DonliLoginButton = ({
  id,
  branding,
  classes,
  showPartnerChip,
  clientId,
  redirectUri,
}: DonliLoginButtonProps) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <DonliAuthModal
        opened={opened}
        onClose={() => setOpened(false)}
        clientId={clientId}
        redirectUri={redirectUri}
      />
      <IntegrationLoginButton
        id={id}
        branding={branding}
        classes={classes}
        showPartnerChip={showPartnerChip}
        color='#fb426b'
        onClick={() => setOpened(true)}
      />
    </>
  );
};

export default DonliLoginButton;
