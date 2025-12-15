import { Progress, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.container}>
      <Text size='sm' className={styles.stepText}>
        {t('tutorial.stepProgress', { current: currentStep, total: totalSteps })}
      </Text>
      <Progress value={progress} size='sm' className={styles.progressBar} />
    </div>
  );
}

export default ProgressIndicator;

