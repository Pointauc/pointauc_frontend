import { Collapse, Divider, Stack } from '@mantine/core';

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
  title: string;
  hint?: string;
  isEnabled: boolean;
  children: ReactNode;
}

const ExtraModeCard = ({ control, switchName, title, hint, isEnabled, children }: ExtraModeCardProps) => {
  return (
    <SettingsCard>
      <Stack gap={0}>
        <SettingsRow htmlFor={switchName}>
          <FormSwitchField name={switchName} control={control} label={<FieldLabel text={title} hint={hint} />} />
        </SettingsRow>

        <Collapse in={isEnabled}>{children}</Collapse>
      </Stack>
    </SettingsCard>
  );
};

export default ExtraModeCard;
