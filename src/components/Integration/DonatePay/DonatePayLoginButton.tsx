import { useState } from 'react';

import { IntegrationLoginButton } from '../AuthFlow/Redirect/LoginButton/LoginButton.tsx';

import RegionSelectModal from './RegionSelectModal.tsx';

import TokenFlow = Integration.TokenFlow;

interface DonatePayLoginButtonProps {
  integration: Integration.Config<TokenFlow>;
}

function DonatePayLoginButton({ integration }: DonatePayLoginButtonProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <RegionSelectModal opened={opened} onClose={() => setOpened(false)} />
      <IntegrationLoginButton integration={integration} onClick={() => setOpened(true)} />
    </>
  );
}

export default DonatePayLoginButton;
