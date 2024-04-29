import RedirectLoginButton from '@components/Integration/AuthFlow/Redirect/LoginButton/LoginButton.tsx';

interface Params {
  url: {
    path: string;
    params: Record<string, string>;
  };
  authenticate: Integration.RedirectFlow['authenticate'];
}

export const buildRedirectAuthFlow = ({ url, authenticate }: Params): Integration.RedirectFlow => {
  const authUrl = new URL(url.path);
  authUrl.search = new URLSearchParams(url.params).toString();

  return {
    type: 'redirect',
    authenticate,
    url: authUrl.toString(),
    validate: () => true,
    loginComponent: RedirectLoginButton,
  };
};
