import { Alert, List, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface LotteryAnalogyProps {
  showTitle?: boolean;
}

/**
 * Reusable component explaining the lottery ticket analogy for Random.org signed flow.
 * Used in both the modal and the verification instructions page.
 */
const LotteryAnalogy = ({ showTitle = true }: LotteryAnalogyProps) => {
  const { t } = useTranslation();

  return (
    <>
      {showTitle && (
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.randomOrgSigned.analogy')}
        </Title>
      )}
      <Alert color='gray' p='md' radius='md' variant='light'>
        <Text size='sm' fw={600} mb='md'>
          {t('wheel.randomnessModal.sources.randomOrgSigned.analogyIntro')}
        </Text>
        <List spacing='sm' size='sm'>
          <List.Item>
            <Text fw={600} mb='xs'>
              {t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep1Title')}
            </Text>
            <Text size='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep1')}</Text>
          </List.Item>
          <List.Item>
            <Text fw={600} mb='xs'>
              {t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep2Title')}
            </Text>
            <Text size='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep2')}</Text>
          </List.Item>
          <List.Item>
            <Text fw={600} mb='xs'>
              {t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep3Title')}
            </Text>
            <Text size='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep3')}</Text>
          </List.Item>
          <List.Item>
            <Text fw={600} mb='xs'>
              {t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep4Title')}
            </Text>
            <Text size='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep4')}</Text>
          </List.Item>
          <List.Item>
            <Text fw={600} mb='xs'>
              {t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep5Title')}
            </Text>
            <Text size='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.analogyStep5')}</Text>
          </List.Item>
        </List>
        <Text size='sm' mt='md' fs='italic' c='dimmed'>
          {t('wheel.randomnessModal.sources.randomOrgSigned.analogyConclusion')}
        </Text>
      </Alert>
    </>
  );
};

export default LotteryAnalogy;

