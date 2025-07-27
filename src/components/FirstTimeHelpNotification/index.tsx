import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FirstTimeHelpNotificationProps {
  featureKey: string;
  message: string | React.ReactNode;
}

export const FirstTimeHelpNotification = ({ featureKey, message }: FirstTimeHelpNotificationProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    console.log('FirstTimeHelpNotification');
  }, []);

  useEffect(() => {
    const shouldShowHelpNotification = localStorage.getItem(featureKey) !== 'true';
    if (shouldShowHelpNotification) {
      notifications.show({
        title: t('common.needHelp'),
        message,
        color: 'blue',
        withCloseButton: true,
        autoClose: 30000,
      });
      localStorage.setItem(featureKey, 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
