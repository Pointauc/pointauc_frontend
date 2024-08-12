import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { isObject } from '@utils/common.utils.ts';

interface MetadataText {
  title: string;
  description: string;
}

const Essentials = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const metadata: MetadataText = t(`metadata.${pathname}`, { returnObjects: true, defaultValue: null });

  if (!isObject(metadata)) {
    return (
      <>
        <meta name='robots' content='noindex' />
        <title>Pointauc | Live Auction for Streamers</title>
        <meta
          name='description'
          content='Host interactive auctions where your viewers can bid on games, videos, and more using Twitch channel points or donations.'
        />
      </>
    );
  }

  return (
    <>
      <title>{metadata?.title}</title>
      <meta name='description' content={metadata?.description} />
    </>
  );
};

export default Essentials;
