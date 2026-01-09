import { Alert, Badge, Card, Grid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import classes from './RandomnessExplanationModal.module.css';

interface IntroViewProps {
  onSourceClick: (source: 'local-basic' | 'random-org' | 'random-org-signed') => void;
}

const IntroView = ({ onSourceClick }: IntroViewProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap='lg'>
      <div>
        <Title order={2} mb='md'>
          {t('wheel.randomnessModal.intro.title')}
        </Title>
        <Text>{t('wheel.randomnessModal.intro.description')}</Text>
      </div>

      <Alert variant='light' color='blue'>
        <Text size='sm'>{t('wheel.randomnessModal.intro.tldrNote')}</Text>
      </Alert>

      <Text>{t('wheel.randomnessModal.intro.choosePrompt')}</Text>

      <Grid gutter='md'>
        <Grid.Col span={4}>
          <Card
            shadow='sm'
            padding='lg'
            radius='md'
            withBorder
            className={classes.sourceCard}
            onClick={() => onSourceClick('local-basic')}
          >
            <Stack gap='sm' align='center'>
              <Title order={3} size='h4' ta='center'>
                {t('wheel.randomnessSource.localBasic')}
              </Title>
              <Badge color='green'>{t('wheel.randomnessModal.intro.standard')}</Badge>
              <Text size='sm' ta='center' c='dimmed'>
                {t('wheel.randomnessModal.intro.standardDescription')}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card
            shadow='sm'
            padding='lg'
            radius='md'
            withBorder
            className={classes.sourceCard}
            onClick={() => onSourceClick('random-org')}
          >
            <Stack gap='sm' align='center'>
              <Title order={3} size='h4' ta='center'>
                {t('wheel.randomnessSource.randomOrg')}
              </Title>
              <Badge color='blue'>{t('wheel.randomnessModal.intro.trueRandom')}</Badge>
              <Text size='sm' ta='center' c='dimmed'>
                {t('wheel.randomnessModal.intro.trueRandomDescription')}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card
            shadow='sm'
            padding='lg'
            radius='md'
            withBorder
            className={classes.sourceCard}
            onClick={() => onSourceClick('random-org-signed')}
          >
            <Stack gap='sm' align='center'>
              <Title order={3} size='h4' ta='center'>
                {t('wheel.randomnessSource.randomOrgSigned')}
              </Title>
              <Badge color='grape'>{t('wheel.randomnessModal.intro.maxSecurity')}</Badge>
              <Text size='sm' ta='center' c='dimmed'>
                {t('wheel.randomnessModal.intro.maxSecurityDescription')}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default IntroView;

