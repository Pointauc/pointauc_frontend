import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Tutorial } from '@domains/tutorials/models/tutorial.model';
import { isTutorialCompleted, isTutorialDismissed, markTutorialDismissed } from '@domains/tutorials/services/tutorialStorage';

interface TutorialStartNotificationProps {
  tutorial: Tutorial;
  onStart: () => void;
}

function TutorialStartNotification({ tutorial, onStart }: TutorialStartNotificationProps) {
  const { t } = useTranslation();

  useEffect(() => {
    // Check if tutorial should be shown
    const shouldShow = !isTutorialCompleted(tutorial.id) && !isTutorialDismissed(tutorial.id);

    if (shouldShow) {
      const notificationId = `tutorial-${tutorial.id}`;

      notifications.show({
        id: notificationId,
        title: tutorial.title,
        message: t('tutorial.notificationMessage', { description: tutorial.description }),
        color: 'blue',
        autoClose: false,
        withCloseButton: true,
        position: 'bottom-right',
        onClick: () => {
          onStart();
          notifications.hide(notificationId);
        },
        onClose: () => {
          markTutorialDismissed(tutorial.id);
        },
      });
    }
  }, [tutorial, onStart, t]);

  return null;
}

export default TutorialStartNotification;

