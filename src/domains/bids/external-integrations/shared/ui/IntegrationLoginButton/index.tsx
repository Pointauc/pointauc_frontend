import { Button, Group, Text } from '@mantine/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import * as Integration from '@models/integration';

interface IntegrationLoginButtonProps {
  integration: Integration.Config;
  onClick: () => void;
  classes?: Integration.LoginButtonClasses;
}

const IntegrationLoginButton = ({ integration, onClick, classes }: IntegrationLoginButtonProps) => {
  const {
    branding: { icon: Icon, partner, description },
    id,
  } = integration;
  const { t } = useTranslation();

  const isPartner = partner && description;

  if (isPartner) {
    return (
      <Button
        className={clsx('h-auto min-h-[56px] px-4 py-2', classes?.button)}
        classNames={{ label: 'flex flex-col items-start' }}
        variant='filled'
        onClick={onClick}
        data-integration={id}
      >
        <Group w='100%' justify='center' gap='xs'>
          <Icon size={22} />
          <Text size='lg' fw={600}>
            {t(`integration.${id}.name`)}
          </Text>
        </Group>
        <Text size='xs'>{description}</Text>
      </Button>
    );
  }

  return (
    <Button
      className={clsx('h-10 text-[#f1f1f1]', classes?.button)}
      variant='filled'
      leftSection={<Icon size={22} />}
      onClick={onClick}
      data-integration={id}
    >
      {t(`integration.${id}.name`)}
    </Button>
  );
};

export default IntegrationLoginButton;
