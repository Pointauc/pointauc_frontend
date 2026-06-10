import { Divider } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { RootState } from '@reducers';

import DonationIntegrationCard from './DonationIntegrationCard';

interface DonationSectionProps {
  onlyPartners?: boolean;
}

const DonationSection = ({ onlyPartners = false }: DonationSectionProps) => {
  const { t } = useTranslation();
  const authData = useSelector((root: RootState) => root.user.authData);

  const { available, unavailable } = useMemo(() => {
    const integrationsToUse = onlyPartners
      ? integrationUtils.filterBy.partners(integrations.donate)
      : integrations.donate;
    return integrationUtils.groupBy.availability(integrationsToUse, authData);
  }, [authData, onlyPartners]);
  const { partner: partnerIntegrations, regular: regularIntegrations } = useMemo(
    () => integrationUtils.groupBy.partner(unavailable),
    [unavailable],
  );

  const buttonsGridClassName = 'grid grid-cols-4 items-start gap-3 px-4';
  const integrationCardsClassName = 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 px-4';
  const integrationLoginButtonClassName = 'w-full';
  const partnerIntegrationLoginButtonClassName = 'w-full min-w-[220px] max-w-[280px]';

  return (
    <SettingsSection
      id='website-settings-donations'
      title={t('settings.website.toc.donations')}
      icon={<IconCoin size={24} />}
    >
      <SettingsCard shadow='none'>
        {available.length > 0 && (
          <>
            <div className='flex flex-col gap-3 py-3'>
              <div className={integrationCardsClassName}>
                {available.map((integration) => (
                  <DonationIntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
            <Divider />
          </>
        )}

        <>
          <div className='flex flex-col gap-6 py-3'>
            {unavailable.length > 0 && (
              <>
                {partnerIntegrations.length > 0 && (
                  <div className='grid grid-cols-2 items-start gap-3 px-4'>
                    {partnerIntegrations.map((integration) => (
                      <div key={integration.id} className='w-full'>
                        <integration.authFlow.loginComponent
                          id={integration.id}
                          branding={integration.branding}
                          classes={{ button: partnerIntegrationLoginButtonClassName }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {regularIntegrations.length > 0 && (
                  <div className='grid grid-cols-4 items-start gap-3 px-4'>
                    {regularIntegrations.map((integration) => (
                      <div key={integration.id} className='min-w-0'>
                        <integration.authFlow.loginComponent
                          id={integration.id}
                          branding={integration.branding}
                          classes={{ button: integrationLoginButtonClassName }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      </SettingsCard>
    </SettingsSection>
  );
};

export default DonationSection;
