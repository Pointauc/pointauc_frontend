import { useTranslation } from 'react-i18next';
import { SimpleGrid } from '@mantine/core';

import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import TokenSettings from '@pages/settings/IntegrationsSettings/TokenSettings/TokenSettings';
import IntegrationCommon from '@pages/settings/IntegrationsSettings/Common/IntegrationCommon';

const CommonIntegrationsSettings = () => {
  const { t } = useTranslation();

  return (
    <SettingsGroup className='common-integrations-settings' title={t('settings.integrationCommon.integrationCommon')}>
      <SimpleGrid spacing='md' cols={{ base: 1, md: 2 }}>
        <IntegrationCommon />
        <TokenSettings />
      </SimpleGrid>
    </SettingsGroup>
  );
};

export default CommonIntegrationsSettings;
