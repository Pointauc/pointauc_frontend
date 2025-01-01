import { removeCookie } from '@utils/common.utils.ts';

const LogoutPage = () => {
  removeCookie('userSession');
  removeCookie('userSession.sig');
  document.location.href = '/';

  return null;
};

export default LogoutPage;
