import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import * as Integration from '@models/integration';

import { saveRedirectReturnPath } from './redirectReturnPath';

interface RedirectLoginButtonProps extends Integration.LoginButtonProps {
  buildUrl: () => string;
}

const RedirectLoginButton = ({ id, branding, buildUrl, classes, showPartnerChip, color }: RedirectLoginButtonProps) => {
  const handleAuth = (): void => {
    saveRedirectReturnPath(id);
    window.open(buildUrl(), '_self');
  };

  return (
    <IntegrationLoginButton
      id={id}
      branding={branding}
      onClick={handleAuth}
      classes={classes}
      showPartnerChip={showPartnerChip}
      color={color}
    />
  );
};

export default RedirectLoginButton;
