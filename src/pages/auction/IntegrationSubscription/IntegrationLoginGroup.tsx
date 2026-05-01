import { Stack, Text } from '@mantine/core';

import * as Integration from '@models/integration';

interface IntegrationLoginGroupProps {
  integrations: Integration.Config[];
  title: string;
}

const IntegrationLoginGroup = ({ integrations, title }: IntegrationLoginGroupProps) => {
  if (integrations.length === 0) {
    return null;
  }

  return (
    <Stack gap='xs'>
      <Text size='lg' fw={600} c='dimmed'>
        {title}
      </Text>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {integrations.map((integration) => (
          <div key={integration.id} className='min-w-0'>
            <integration.authFlow.loginComponent
              id={integration.id}
              branding={integration.branding}
              classes={{ button: 'w-full' }}
              showPartnerChip
            />
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default IntegrationLoginGroup;
