import { Stack } from '@mantine/core';

import DonationSection from '@domains/user-settings-v2/Widgets/donations/DonationSection';
import ExchangeRateControls from '@domains/user-settings-v2/Widgets/donations/ExchangeRateControls';
import ExchangeRateExample from '@domains/user-settings-v2/Widgets/donations/ExchangeRateExample';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';

interface VideoRequestSettingsDonationsSectionProps {
  conversionLabel: string;
}

const VideoRequestSettingsDonationsSection = ({ conversionLabel }: VideoRequestSettingsDonationsSectionProps) => (
  <Stack gap='md'>
    <SettingsCard>
      <SettingsRow compact htmlFor='pointsRate' description={<ExchangeRateExample />}>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <FieldLabel text={conversionLabel} withDescriptionIcon />
          <ExchangeRateControls />
        </div>
      </SettingsRow>
    </SettingsCard>
    <DonationSection onlyPartners />
  </Stack>
);

export default VideoRequestSettingsDonationsSection;
