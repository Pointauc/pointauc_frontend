import { useState } from 'react';

import { IntegrationLoginButton } from '@components/Integration/AuthFlow/Redirect/LoginButton/LoginButton.tsx';
import TokenLoginModal from '@components/Integration/AuthFlow/Token/TokenLoginButton/TokenLoginModal.tsx';

import TokenFlow = Integration.TokenFlow;

const TokenLoginButton = ({ integration, classes }: Integration.LoginButtonProps<TokenFlow>) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <TokenLoginModal
        id={integration.id}
        authenticate={integration.authFlow.authenticate}
        opened={opened}
        onClose={() => setOpened(false)}
      />
      <IntegrationLoginButton integration={integration} onClick={() => setOpened(true)} classes={classes} />
    </>
  );
};

export default TokenLoginButton;
