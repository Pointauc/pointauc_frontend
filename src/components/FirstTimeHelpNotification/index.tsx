import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

interface FirstTimeHelpNotificationProps {
  featureKey: string;
  message: string | React.ReactNode;
  title: string;
}

export const FirstTimeHelpNotification = ({ featureKey, message, title }: FirstTimeHelpNotificationProps) => {
  useEffect(() => {
    const shouldShowHelpNotification = localStorage.getItem(featureKey) !== 'true';
    if (shouldShowHelpNotification) {
      notifications.show({
        title,
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
