import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPointaucDesktop } from './checkIsDesktop';
import { parseDesktopOAuthProtocol } from './parseOAuthProtocol';

const DesktopOAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const desktop = getPointaucDesktop();
    if (!desktop?.onProtocolUrl) {
      return;
    }

    const unsubscribe = desktop.onProtocolUrl((url: string) => {
      const parsed = parseDesktopOAuthProtocol(url);
      if (parsed) {
        const searchSuffix = parsed.search ? `?${parsed.search}` : '';
        navigate(`/${parsed.providerId}/redirect${searchSuffix}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default DesktopOAuthListener;
