import React, { useCallback, useMemo } from 'react';
import Linkify from 'linkify-react';
import { MultiToken, Opts as LinkifyOptions } from 'linkifyjs';

import LinkedTextUrl from '@components/LinkedText/LinkedTextUrl.tsx';

type LinkedTextProps =
  | {
      children: React.ReactNode;
      safety?: false;
      allowedDomains?: never;
      copyable?: boolean;
    }
  | {
      children: React.ReactNode;
      safety: true;
      allowedDomains: string[];
      copyable?: boolean;
    };

function createUrlValidator(allowedDomains: string[]) {
  return function validateUrl(value: string, token: MultiToken): boolean {
    try {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();

      return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  };
}

const LinkedText = ({ children, safety = false, allowedDomains = [], copyable = false }: LinkedTextProps) => {
  const validateUrl = useMemo(
    () => (safety ? createUrlValidator(allowedDomains) : () => true),
    [allowedDomains, safety],
  );

  const renderUrl = useCallback(
    ({ attributes, content }: { attributes: { [attr: string]: any }; content: string }) => {
      const { href, ...props } = attributes;

      return <LinkedTextUrl href={href} content={content} copyable={copyable} linkProps={props} />;
    },
    [copyable],
  );

  const linkifyOptions = useMemo((): LinkifyOptions => {
    const options: LinkifyOptions = {
      target: '_blank',
      render: { url: renderUrl },
    };

    if (safety && validateUrl) {
      options.validate = { url: validateUrl };
    }

    return options;
  }, [renderUrl, safety, validateUrl]);

  return <Linkify options={linkifyOptions}>{children}</Linkify>;
};

export default LinkedText;
