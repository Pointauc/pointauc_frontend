import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import * as Integration from '@models/integration';

interface RedirectLoginButtonProps extends Integration.LoginButtonProps {
  buildUrl: () => string;
}

const RedirectLoginButton = ({ id, branding, buildUrl, classes }: RedirectLoginButtonProps) => {
  const handleAuth = (): void => {
    window.open(buildUrl(), '_self');
  };

  return <IntegrationLoginButton id={id} branding={branding} onClick={handleAuth} classes={classes} />;
};

export default RedirectLoginButton;
