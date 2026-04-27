import { useState } from 'react';
import { Checkbox, Stack, Text } from '@mantine/core';
import i18next from 'i18next';

interface ExternalRedirectCheckboxesState {
  isAddDomainToAllowListEnabled: boolean;
  isIgnoreExternalLinkConfirmationEnabled: boolean;
}

interface ExternalRedirectConfirmationModalContentProps {
  href: string;
  domain: string | null;
  onStateChange: (state: ExternalRedirectCheckboxesState) => void;
}

const ExternalRedirectConfirmationModalContent = ({
  href,
  domain,
  onStateChange,
}: ExternalRedirectConfirmationModalContentProps) => {
  const [isAddDomainToAllowListEnabled, setIsAddDomainToAllowListEnabled] = useState(false);
  const [isIgnoreExternalLinkConfirmationEnabled, setIsIgnoreExternalLinkConfirmationEnabled] = useState(false);

  const handleAddDomainToAllowListChange = (value: boolean) => {
    setIsAddDomainToAllowListEnabled(value);
    onStateChange({
      isAddDomainToAllowListEnabled: value,
      isIgnoreExternalLinkConfirmationEnabled,
    });
  };

  const handleIgnoreExternalLinkConfirmationChange = (value: boolean) => {
    setIsIgnoreExternalLinkConfirmationEnabled(value);
    onStateChange({
      isAddDomainToAllowListEnabled,
      isIgnoreExternalLinkConfirmationEnabled: value,
    });
  };

  return (
    <Stack gap='md'>
      <Text>{i18next.t('common.externalLinkDisclaimer')}</Text>
      <Text fw={500} c='orange'>
        {href}
      </Text>

      <Stack gap='xs'>
        {domain && (
          <Checkbox
            checked={isAddDomainToAllowListEnabled}
            onChange={(event) => handleAddDomainToAllowListChange(event.currentTarget.checked)}
            label={i18next.t('common.addDomainToAllowList', { domain })}
          />
        )}
        <Checkbox
          checked={isIgnoreExternalLinkConfirmationEnabled}
          onChange={(event) => handleIgnoreExternalLinkConfirmationChange(event.currentTarget.checked)}
          label={i18next.t('common.ignoreExternalLinkConfirmation')}
        />
      </Stack>
    </Stack>
  );
};

export type { ExternalRedirectCheckboxesState };
export default ExternalRedirectConfirmationModalContent;
