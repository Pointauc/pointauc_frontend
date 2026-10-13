import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import { saveRedirectReturnPath } from '@domains/bids/external-integrations/shared/auth/redirect/redirectReturnPath';
import * as Integration from '@models/integration';
import { startIntegrationLogin } from '@shared/lib/desktop/startIntegrationLogin';

import { buildAuthorizeUrl } from './auth.ts';
import styles from './index.module.css';

const DonateXLoginButton = ({ id, branding, classes, showPartnerChip }: Integration.LoginButtonProps) => {
  const handleAuth = async (): Promise<void> => {
    try {
      saveRedirectReturnPath(id);
      const url = await buildAuthorizeUrl();
      startIntegrationLogin('donatex', url);
    } catch (e) {
      console.error('Failed to start DonateX auth', e);
    }
  };

  return (
    <IntegrationLoginButton
      id={id}
      branding={branding}
      onClick={() => void handleAuth()}
      classes={{ ...classes, button: `${classes?.button ?? ''} ${styles.loginButton}` }}
      showPartnerChip={showPartnerChip}
    />
  );
};

export default DonateXLoginButton;
