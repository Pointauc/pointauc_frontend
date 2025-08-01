import React, { useCallback, useMemo } from 'react';
import Linkify from 'linkify-react';
import { Opts as LinkifyOptions } from 'linkifyjs';

import LinkedTextUrl from '@components/LinkedText/LinkedTextUrl.tsx';

interface LinkedTextProps {
  children: React.ReactNode;
  copyable?: boolean;
}

const LinkedText = ({ children, copyable = false }: LinkedTextProps) => {
  const renderUrl = useCallback(
    ({ attributes, content }: { attributes: { [attr: string]: any }; content: string }) => {
      const { href, ...props } = attributes;

      return <LinkedTextUrl href={href} content={content} copyable={copyable} linkProps={props} />;
    },
    [copyable],
  );

  const linkifyOptions = useMemo((): LinkifyOptions => {
    return {
      target: '_blank',
      defaultProtocol: 'https',
      render: { url: renderUrl },
      format: (text: string) => text.replace(/^https?:\/\//, ''),
      truncate: 36,
    };
  }, [renderUrl]);

  return <Linkify options={linkifyOptions}>{children}</Linkify>;
};

export default LinkedText;
