import { Divider, Modal, Stack } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Integration from '@models/integration';
import { usePromotionBanner } from '@domains/promotions/lib/usePromotionBanner';
import { PromotionBanner } from '@domains/promotions/ui/PromotionBanner';
import IntegrationConnectButton from '@pages/auction/IntegrationSubscription/IntegrationConnectButton.tsx';
import IntegrationLoginGroup from '@pages/auction/IntegrationSubscription/IntegrationLoginGroup.tsx';

const sortIntegrationsByPartner = (integrations: Integration.Config[]): Integration.Config[] => {
  const partnerIntegrations = integrations.filter((integration) => integration.branding.partner);
  const regularIntegrations = integrations.filter((integration) => !integration.branding.partner);

  return [...partnerIntegrations, ...regularIntegrations];
};

interface IntegrationSubscriptionLoginsProps {
  integrations: Integration.Config[];
}

const IntegrationSubscriptionLogins = ({ integrations }: IntegrationSubscriptionLoginsProps) => {
  const { t } = useTranslation();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const { isVisible: isAuctionBannerVisible, banner: auctionBanner } = usePromotionBanner('auction_integrations');
  const isIhaqReplacedByBanner = isAuctionBannerVisible && Boolean(auctionBanner);

  const partnerIntegrations = useMemo(
    () => integrations.filter((integration) => integration.branding.partner),
    [integrations],
  );
  const regularIntegrations = useMemo(
    () => integrations.filter((integration) => !integration.branding.partner),
    [integrations],
  );

  const connectButtonIntegrations = useMemo(() => {
    if (isIhaqReplacedByBanner) {
      return sortIntegrationsByPartner(integrations);
    }
    return regularIntegrations;
  }, [integrations, isIhaqReplacedByBanner, regularIntegrations]);

  const modalChannelPointIntegrations = useMemo(
    () => sortIntegrationsByPartner(integrations.filter((integration) => integration.type === 'points')),
    [integrations],
  );
  const modalDonationIntegrations = useMemo(
    () => sortIntegrationsByPartner(integrations.filter((integration) => integration.type === 'donate')),
    [integrations],
  );

  if (integrations.length === 0) {
    return null;
  }

  return (
    <>
      <Stack gap='sm' className='mt-1'>
        {partnerIntegrations.length > 0 &&
          partnerIntegrations.map((integration) => {
            if (integration.id === 'ihaq' && isIhaqReplacedByBanner) {
              return (
                <div key={integration.id} className='min-w-0'>
                  <PromotionBanner placement='auction_integrations' className='w-full' />
                </div>
              );
            }

            return (
              <div key={integration.id} className='min-w-0'>
                <integration.authFlow.loginComponent
                  id={integration.id}
                  branding={integration.branding}
                  classes={{ button: 'h-auto min-h-[56px] w-full' }}
                />
              </div>
            );
          })}

        {connectButtonIntegrations.length > 0 && (
          <IntegrationConnectButton integrations={connectButtonIntegrations} onClick={() => setIsModalOpened(true)} />
        )}
      </Stack>

      <Modal
        opened={isModalOpened}
        onClose={() => setIsModalOpened(false)}
        title={t('integration.connectServices')}
        size='xl'
        centered
      >
        <Stack gap='lg'>
          <IntegrationLoginGroup
            integrations={modalChannelPointIntegrations}
            title={t('integration.modalWindow.channelPoints')}
          />
          <IntegrationLoginGroup
            integrations={modalDonationIntegrations}
            title={t('integration.modalWindow.donations')}
          />
        </Stack>
      </Modal>
    </>
  );
};

export default IntegrationSubscriptionLogins;
