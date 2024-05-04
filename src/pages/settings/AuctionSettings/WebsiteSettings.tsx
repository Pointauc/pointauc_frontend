import React from 'react';
import { Grid } from '@mui/material';

import TimerSettings from '@pages/settings/AuctionSettings/TimerSettings/TimerSettings.tsx';
import AppearanceSettings from '@pages/settings/AuctionSettings/Appearance/AppearanceSettings.tsx';
import AuctionSettings from '@pages/settings/AuctionSettings/Auction/AuctionSettings.tsx';
import MarblesSettings from '@pages/settings/AuctionSettings/Marbles/MarblesSettings.tsx';
import WheelOfLuckSettings from '@pages/settings/AuctionSettings/WheelOfLuck/WheelOfLuckSettings.tsx';
import '@pages/settings/AuctionSettings/WebsiteSettings.scss';

const WebsiteSettings = () => {
  return (
    <Grid container wrap='wrap' className='auction-settings' spacing={4}>
      <Grid item xs={12}>
        <TimerSettings />
      </Grid>
      <Grid item xs={6}>
        <AppearanceSettings />
      </Grid>
      <Grid item xs={6}>
        <AuctionSettings />
      </Grid>
      <Grid item xs={6}>
        <MarblesSettings />
      </Grid>
      <Grid item xs={6}>
        <WheelOfLuckSettings />
      </Grid>
    </Grid>
  );
};

export default WebsiteSettings;
