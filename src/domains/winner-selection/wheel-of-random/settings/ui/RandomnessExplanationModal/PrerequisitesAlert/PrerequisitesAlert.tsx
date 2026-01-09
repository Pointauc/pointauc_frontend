import { Alert, List } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const PrerequisitesAlert = () => {
  const { t } = useTranslation();

  return (
    <Alert 
      icon={<IconAlertCircle size={20} />} 
      color='yellow' 
      variant='light'
      title={t('tickets.verification.prerequisites.title')}
    >
      <List size='sm' spacing='xs'>
        <List.Item>{t('tickets.verification.prerequisites.showParticipants')}</List.Item>
        <List.Item>{t('tickets.verification.prerequisites.showTicket')}</List.Item>
      </List>
    </Alert>
  );
};

export default PrerequisitesAlert;

