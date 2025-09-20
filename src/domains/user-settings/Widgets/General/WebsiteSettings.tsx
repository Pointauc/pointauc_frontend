import { Grid } from '@mantine/core';

import TimerSettings from '@domains/user-settings/Widgets/General/TimerSettings/TimerSettings';
import AppearanceSettings from '@domains/user-settings/Widgets/General/Appearance/AppearanceSettings';
import AuctionSettings from '@domains/user-settings/Widgets/General/Auction/AuctionSettings';
import MarblesSettings from '@domains/user-settings/Widgets/General/Marbles/MarblesSettings';
import WheelOfLuckSettings from '@domains/user-settings/Widgets/General/WheelOfLuck/WheelOfLuckSettings';

const WebsiteSettings = () => {
  return (
    <Grid gutter='xl' overflow='clip'>
      <Grid.Col span={12}>
        <TimerSettings />
      </Grid.Col>
      <Grid.Col span={6}>
        <AppearanceSettings />
      </Grid.Col>
      <Grid.Col span={6}>
        <AuctionSettings />
      </Grid.Col>
      <Grid.Col span={6}>
        <MarblesSettings />
      </Grid.Col>
      <Grid.Col span={6}>
        <WheelOfLuckSettings />
      </Grid.Col>
    </Grid>
  );
};

export default WebsiteSettings;
