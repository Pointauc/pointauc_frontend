import React, { FC, useEffect } from 'react';
import tmi from 'tmi.js';
import { getCookie } from '../../utils/common.utils';

const opts = {
  identity: {
    username: 'skipsome_bot',
    password: 'oauth:bzel1k13fcfoldritkwjbejzx42m2g',
  },
  channels: ['Praden'],
};

const WheelPage: FC = () => {
  useEffect(() => {
    // eslint-disable-next-line new-cap
    const client = new tmi.client(opts);

    const connectionHandler = (): void => {
      console.log(`Connected`);
    };

    client.on('connected', connectionHandler);

    client.connect();

    client.on('message', (channel, tags, message, self) => {
      // "Alca: Hello, World!"
      console.log(`${tags['display-name']}: ${message}`);
    });
  }, []);

  return <div />;
};

export default WheelPage;
