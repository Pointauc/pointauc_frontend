import React from 'react';
import { useSelector } from 'react-redux';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import { RootState } from '@reducers';

import './EventsSettings.scss';

const EventsSettings = () => {
  const isValid = useSelector((state: RootState) => state.user.events.aukus.isValid);

  if (!isValid) return null;

  return <SettingsGroup className='event-group' controlName='events.aukus.enabled' title='Аукус' open={false} />;
};

export default EventsSettings;
