import { Button, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import Modal from '@shared/mantine/ui/Modal';

import { Tutorial } from '@domains/tutorials/models/tutorial.model';

import styles from './TutorialStartModal.module.css';

interface TutorialStartModalProps {
  tutorial: Tutorial;
  opened: boolean;
  onStart: () => void;
  onClose: () => void;
}

function TutorialStartModal({ tutorial, opened, onStart, onClose }: TutorialStartModalProps) {
  const { t } = useTranslation();

  const handleStart = () => {
    onStart();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={tutorial.title} size='lg' centered>
      <div className={styles.content}>
        <Text className={styles.description}>{tutorial.description}</Text>

        <Group justify='flex-end' mt='xl'>
          <Button variant='subtle' color='gray' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleStart}>{t('tutorial.startButton')}</Button>
        </Group>
      </div>
    </Modal>
  );
}

export default TutorialStartModal;

