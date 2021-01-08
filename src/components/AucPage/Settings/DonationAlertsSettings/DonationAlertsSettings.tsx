import React, { FC } from 'react';
import { UseFormMethods } from 'react-hook-form';
import SettingsGroupTitle from '../../../SettingsGroupTitle/SettingsGroupTitle';
import { SettingFields } from '../../../../reducers/AucSettings/AucSettings';

interface DonationAlertsSettingsProps {
  formMethods: UseFormMethods;
  defaultSettings: SettingFields;
  donationAlertsToken?: string;
}

const DonationAlertsSettings: FC<DonationAlertsSettingsProps> = () => {
  return (
    <>
      <SettingsGroupTitle title="Donation Alerts" />
    </>
  );
};

export default DonationAlertsSettings;
