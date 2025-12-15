import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import { aukus } from '@components/Event/events.ts';
import classes from './EventsSettings.module.css';

const EventsSettings = () => {
  const isValid = useSelector((state: RootState) => state.user.events.aukus.isValid);
  const enabled = useSelector((state: RootState) => state.aucSettings.settings.events.aukus.enabled);

  useEffect(() => {
    aukus.enabled.set(enabled);
  }, [enabled]);

  if (!isValid) return null;

  return <SettingsGroup className={classes.eventGroup} controlName='events.aukus.enabled' title='Аукус' open={false} />;
};

export default EventsSettings;
