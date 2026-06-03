import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton.tsx';
import * as Integration from '@models/integration';

import { buildAuthUrl } from './buildAuthUrl';

const TourniquetLoginButton = ({ id, branding, classes, showPartnerChip, ...props }: Integration.LoginButtonProps) => (
  <RedirectLoginButton
    id={id}
    branding={branding}
    buildUrl={buildAuthUrl}
    classes={classes}
    showPartnerChip={showPartnerChip}
    {...props}
  />
);

export default TourniquetLoginButton;
