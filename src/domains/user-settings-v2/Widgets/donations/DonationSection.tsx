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

const DonationSection = () => {
  const { t } = useTranslation();
  const authData = useSelector((root: RootState) => root.user.authData);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(integrations.donate, authData),
    [authData],
  );
  const { partner: partnerIntegrations, regular: regularIntegrations } = useMemo(
    () => integrationUtils.groupBy.partner(unavailable),
    [unavailable],
  );

  const buttonsGridClassName = 'grid grid-cols-[repeat(auto-fit,minmax(180px,max-content))] items-start gap-3 px-4';
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
        <div className='flex flex-col gap-3 py-3'>
          {available.length > 0 && (
            <div className={integrationCardsClassName}>
              {available.map((integration) => (
                <DonationIntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          )}
        </div>

        {available.length > 0 && unavailable.length > 0 && (
          <>
            <Divider />

            <div className='flex flex-col gap-4 py-3'>
              {unavailable.length > 0 && (
                <>
                  {partnerIntegrations.length > 0 && (
                    <div className={`${buttonsGridClassName}`}>
                      {partnerIntegrations.map((integration) => (
                        <div key={integration.id} className='w-full max-w-[280px] min-w-[220px]'>
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
                    <div className={buttonsGridClassName}>
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
        )}
      </SettingsCard>
    </SettingsSection>
  );
};

export default DonationSection;
