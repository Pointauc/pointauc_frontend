import { saveRedirectReturnPath } from '@domains/bids/external-integrations/shared/auth/redirect/redirectReturnPath';
import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton';
import * as Integration from '@models/integration';
import { startIntegrationLogin } from '@shared/lib/desktop/startIntegrationLogin';

import { createAuthorizeUrl } from '../lib/oauth';

const OxygenDonutsLoginButton = ({ id, branding, classes, showPartnerChip }: Integration.LoginButtonProps) => {
  const handleAuth = async (): Promise<void> => {
    try {
      saveRedirectReturnPath(id);
      startIntegrationLogin(id, await createAuthorizeUrl());
    } catch (error) {
      console.error('Failed to start Oxygen Donuts auth', error);
    }
  };

  return (
    <IntegrationLoginButton
      id={id}
      branding={branding}
      classes={classes}
      showPartnerChip={showPartnerChip}
      color='#5b3fd3'
      onClick={() => void handleAuth()}
    />
  );
};

export default OxygenDonutsLoginButton;
