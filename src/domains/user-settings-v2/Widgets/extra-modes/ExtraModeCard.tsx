import { Collapse, Divider } from '@mantine/core';

import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { SettingsForm } from '@models/settings.model.ts';

import type { Control } from 'react-hook-form';
import type { ReactNode } from 'react';

interface ExtraModeCardProps {
  control: Control<SettingsForm>;
  switchName: string;
  title: ReactNode;
  hint?: ReactNode;
  isEnabled: boolean;
  children: ReactNode;
}

const ExtraModeCard = ({ control, switchName, title, hint, isEnabled, children }: ExtraModeCardProps) => {
  return (
    <SettingsCard>
      <div className='flex flex-col'>
        <SettingsRow htmlFor={switchName}>
          <FormSwitchField name={switchName} control={control} label={<FieldLabel text={title} hint={hint} />} />
        </SettingsRow>

        <Collapse in={isEnabled}>{children}</Collapse>
      </div>
    </SettingsCard>
  );
};

export default ExtraModeCard;
