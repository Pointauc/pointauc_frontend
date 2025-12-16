import { useTranslation } from 'react-i18next';
import { Button, Group, Text } from '@mantine/core';
import clsx from 'clsx';

import styles from './LoginButton.module.css';

interface IntegrationLoginButtonProps {
  integration: Integration.Config;
  onClick: () => void;
  classes?: Integration.LoginButtonClasses;
}

export const IntegrationLoginButton = ({ integration, onClick, classes }: IntegrationLoginButtonProps) => {
  const {
    branding: { icon: Icon, partner, description },
    id,
  } = integration;
  const { t } = useTranslation();

  const isPartner = partner && description;

  if (isPartner) {
    return (
      <Button
        className={styles.partnerButton}
        classNames={{ label: styles.partnerContent }}
        variant='filled'
        onClick={onClick}
        data-integration={id}
      >
        <Group w='100%' justify='center' gap='xs'>
          <Icon className={styles.icon} />
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
      className={clsx(styles.loginButton, classes?.button)}
      variant='filled'
      leftSection={<Icon className={clsx(styles.icon, classes?.icon)} />}
      onClick={onClick}
      data-integration={id}
    >
      {t(`integration.${id}.name`)}
    </Button>
  );
};

const RedirectLoginButton = ({ integration, classes }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const handleAuth = (): void => {
    window.open(integration.authFlow.url(), '_self');
  };

  return <IntegrationLoginButton integration={integration} onClick={handleAuth} classes={classes} />;
};

export default RedirectLoginButton;
