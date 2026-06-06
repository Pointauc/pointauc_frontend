import { Button, Group, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import * as Integration from '@models/integration';

interface IntegrationConnectButtonProps {
  integrations: Integration.Config[];
  onClick: () => void;
}

const IntegrationConnectButton = ({ integrations, onClick }: IntegrationConnectButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant='default'
      onClick={onClick}
      className='group border-paper-500/80 bg-paper-700/80 hover:border-paper-400 hover:bg-paper-600 w-full rounded-sm py-2 pr-2.5 pl-1 text-inherit'
      classNames={{ inner: 'w-full', label: 'w-full overflow-visible' }}
      h='auto'
      radius='sm'
    >
      <div className='relative w-full'>
        <div className='flex flex-col items-center justify-center gap-1'>
          <Text fw={600} size='md' className='tracking-[0.03em]'>
            {t('integration.connectServices')}
          </Text>
          <div className='flex shrink-0 gap-1 self-center'>
            {integrations.map((integration, index) => {
              const Icon = integration.branding.icon;

              return (
                <span key={integration.id} className='relative flex items-center justify-center'>
                  <Icon size={22} />
                </span>
              );
            })}
          </div>
        </div>
        <span className='absolute top-1/2 right-0 -translate-y-1/2'>
          <IconChevronRight size={24} />
        </span>
      </div>
    </Button>
  );
};

export default IntegrationConnectButton;
