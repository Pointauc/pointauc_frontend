import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton';
import * as Integration from '@models/integration';

import { createMemeAlertsAuthorizeUrl } from '../lib/auth';

export const MemeAlertsLoginButton = (props: Integration.LoginButtonProps) => (
  <RedirectLoginButton
    {...props}
    buildUrl={() => createMemeAlertsAuthorizeUrl()}
    color='#8649f6'
  />
);

export default MemeAlertsLoginButton;
