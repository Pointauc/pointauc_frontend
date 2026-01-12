import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import * as Integration from '@models/integration';

const RedirectLoginButton = ({ integration, classes }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const handleAuth = (): void => {
    window.open(integration.authFlow.url(), '_self');
  };

  return <IntegrationLoginButton integration={integration} onClick={handleAuth} classes={classes} />;
};

export default RedirectLoginButton;
