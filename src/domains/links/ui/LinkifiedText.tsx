import React, { useCallback, useMemo } from 'react';
import Linkify from 'linkify-react';
import { Opts as LinkifyOptions } from 'linkifyjs';

import LinkifiedTextUrl from '@domains/links/ui/LinkifiedTextUrl';

interface LinkifiedTextProps {
  children: React.ReactNode;
  copyable?: boolean;
}

const LinkifiedText = ({ children, copyable = false }: LinkifiedTextProps) => {
  const renderUrl = useCallback(
    ({ attributes, content }: { attributes: { [attr: string]: any }; content: string }) => {
      const { href, ...props } = attributes;

      return <LinkifiedTextUrl href={href} content={content} copyable={copyable} linkProps={props} />;
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

export default LinkifiedText;
