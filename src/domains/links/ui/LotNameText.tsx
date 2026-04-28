import { Anchor } from '@mantine/core';
import React, { Fragment, useCallback } from 'react';

import { parseMarkdownLotLink } from '@domains/links/lib/lotNameLink';
import { checkShouldShowExternalLinkConfirmation } from '@domains/links/lib/url';
import openExternalRedirectConfirmationModal from '@domains/links/ui/ExternalRedirectConfirmationModal';
import LinkifiedText from '@domains/links/ui/LinkifiedText';

interface LotNameTextProps {
  value: string;
  className?: string;
}

const LotNameText = ({ value, className }: LotNameTextProps) => {
  const handleLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const shouldShowExternalLinkConfirmation = checkShouldShowExternalLinkConfirmation({
      url: href,
    });

    if (shouldShowExternalLinkConfirmation) {
      event.preventDefault();
      openExternalRedirectConfirmationModal({
        href,
        onConfirm: () => window.open(href, '_blank'),
      });
    }
  }, []);

  const markdownLink = parseMarkdownLotLink(value);
  if (!markdownLink) {
    return (
      <span className={className}>
        <LinkifiedText>{value}</LinkifiedText>
      </span>
    );
  }

  const textParts = [value.slice(0, markdownLink.startIndex), markdownLink.label, value.slice(markdownLink.endIndex)];

  return (
    <span className={className}>
      {textParts[0] && <Fragment>{textParts[0]}</Fragment>}
      <Anchor
        td='underline'
        href={markdownLink.href}
        target='_blank'
        rel='noreferrer'
        fz={32}
        onClick={(event) => handleLinkClick(event, markdownLink.href)}
      >
        {textParts[1]}
      </Anchor>
      {textParts[2] && <Fragment>{textParts[2]}</Fragment>}
    </span>
  );
};

export default LotNameText;
