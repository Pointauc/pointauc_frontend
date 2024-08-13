import React from 'react';
import { useLocation } from 'react-router-dom';

const data = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pointauc',
  alternateName: ['Stream Auction', 'Twitch Auction'],
  url: 'https://pointauc.com/',
});

const StructuredData = () => {
  const { pathname } = useLocation();

  if (pathname !== '/') {
    return null;
  }

  return <script type='application/ld+json'>{data}</script>;
};

export default StructuredData;
