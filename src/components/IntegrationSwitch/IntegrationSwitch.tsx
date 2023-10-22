import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import './IntegrationSwitch.scss';
import { Switch } from '@material-ui/core';
import { SubscribeState } from '../../reducers/Subscription/Subscription';

interface IntegrationSwitchProps {
  state: SubscribeState;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  title: string;
}

const IntegrationSwitch: FC<IntegrationSwitchProps> = ({ state, icon, onChange, title }) => {
  const [enabled, setEnabled] = useState<boolean>(state.actual);

  useEffect(() => {
    setEnabled(state.actual);
  }, [state.actual]);

  const handleSwitchChange = useCallback(
    (e: any, checked: boolean): void => {
      setEnabled(checked);
      onChange(checked);
    },
    [onChange],
  );

  return (
    <div className="row integration-switch">
      <div className="col">
        {icon}
        <span className="label">{title}</span>
      </div>
      <Switch onChange={handleSwitchChange} disabled={state.loading} checked={enabled} />
    </div>
  );
};

export default IntegrationSwitch;
