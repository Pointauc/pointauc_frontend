import {
  Anchor,
  Card,
  Collapse,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title,
  Code,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight, IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import LotteryAnalogy from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/LotteryAnalogy';
import PrerequisitesAlert from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/PrerequisitesAlert/PrerequisitesAlert';

const TicketVerificationInstructionsPage = () => {
  const { t } = useTranslation();
  const [analogyOpened, { toggle: toggleAnalogy }] = useDisclosure(false);

  return (
    <PageContainer>
      <Container size='md' py='xl'>
        <Stack gap='lg' pb='md'>
          <Group justify='space-between' align='center'>
            <Title order={1}>{t('tickets.verification.title')}</Title>
            <IconShieldCheck size={48} color='var(--mantine-color-blue-6)' />
          </Group>

          <Alert icon={<IconInfoCircle size={20} />} color='blue' variant='light'>
            {t('tickets.verification.introduction')}
          </Alert>

          <PrerequisitesAlert />

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Group onClick={toggleAnalogy} style={{ cursor: 'pointer', userSelect: 'none' }} justify='space-between'>
                <Title order={2}>{t('tickets.verification.analogyTitle')}</Title>
                {analogyOpened ? <IconChevronDown size={24} /> : <IconChevronRight size={24} />}
              </Group>
              <Text c='dimmed' size='sm'>
                {t('tickets.verification.analogyDescription')}
              </Text>
              <Collapse in={analogyOpened}>
                <LotteryAnalogy showTitle={false} />
              </Collapse>
            </Stack>
          </Card>

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={2}>{t('tickets.verification.flowTitle')}</Title>
              <Text>{t('tickets.verification.flowDescription')}</Text>
              <Paper bg='gray' p='md' radius='md'>
                <List spacing='xs' type='ordered'>
                  <List.Item>{t('tickets.verification.flow.step1')}</List.Item>
                  <List.Item>{t('tickets.verification.flow.step2')}</List.Item>
                  <List.Item>{t('tickets.verification.flow.step3')}</List.Item>
                  <List.Item>{t('tickets.verification.flow.step4')}</List.Item>
                  <List.Item>{t('tickets.verification.flow.step5')}</List.Item>
                </List>
              </Paper>
            </Stack>
          </Card>

          <Divider />

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={2}>{t('tickets.verification.recordStructureTitle')}</Title>
              <Text>{t('tickets.verification.recordStructureDescription')}</Text>
              <List spacing='sm'>
                <List.Item>
                  <Text fw={600}>{t('tickets.verification.recordField.ticketId')}</Text>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.verification.recordField.ticketIdDescription')}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600}>{t('tickets.verification.recordField.timestamps')}</Text>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.verification.recordField.timestampsDescription')}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600}>{t('tickets.verification.recordField.randomNumber')}</Text>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.verification.recordField.randomNumberDescription')}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600}>{t('tickets.verification.recordField.participants')}</Text>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.verification.recordField.participantsDescription')}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600}>{t('tickets.verification.recordField.signature')}</Text>
                  <Text size='sm' c='dimmed'>
                    {t('tickets.verification.recordField.signatureDescription')}
                  </Text>
                </List.Item>
              </List>
            </Stack>
          </Card>

          <Divider />

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={2}>{t('tickets.verification.verificationStepsTitle')}</Title>
              <Text>{t('tickets.verification.verificationStepsIntro')}</Text>

              <Stack gap='lg' mt='md'>
                <div>
                  <Title order={3} mb='sm'>
                    {t('tickets.verification.step1Title')}
                  </Title>
                  <Text mb='sm'>{t('tickets.verification.step1Description')}</Text>
                  <List spacing='sm'>
                    <List.Item>
                      <Trans
                        i18nKey='tickets.verification.step1List1'
                        components={{
                          1: (
                            <Anchor
                              href='https://api.random.org/signatures/form'
                              target='_blank'
                              rel='noopener noreferrer'
                            />
                          ),
                        }}
                      />
                    </List.Item>
                    <List.Item>{t('tickets.verification.step1List2')}</List.Item>
                    <List.Item>{t('tickets.verification.step1List3')}</List.Item>
                    <List.Item>{t('tickets.verification.step1List4')}</List.Item>
                  </List>
                </div>

                <div>
                  <Title order={3} mb='sm'>
                    {t('tickets.verification.step2Title')}
                  </Title>
                  <Text mb='sm'>{t('tickets.verification.step2Description')}</Text>
                  <Text c='red.3' mb='sm'>
                    {t('tickets.verification.step2Description2')}
                  </Text>
                  <Paper bg='gray' p='md' radius='md' mb='sm'>
                    <Text size='sm' fw={600} mb='xs'>
                      {t('tickets.verification.algorithmTitle')}
                    </Text>
                    <List spacing='xs' size='sm'>
                      <List.Item>{t('tickets.verification.algorithmStep1')}</List.Item>
                      <List.Item>{t('tickets.verification.algorithmStep2')}</List.Item>
                      <List.Item>{t('tickets.verification.algorithmStep3')}</List.Item>
                    </List>
                  </Paper>
                  <Text size='sm' c='dimmed' mb='sm'>
                    <Trans
                      i18nKey='tickets.verification.algorithmSource'
                      components={{
                        1: (
                          <Anchor
                            href='https://github.com/Pointauc/pointauc_frontend/blob/master/src/services/PredictionService.ts#L25-L35'
                            target='_blank'
                            rel='noopener noreferrer'
                          />
                        ),
                      }}
                    />
                  </Text>
                  <List spacing='sm'>
                    <List.Item>{t('tickets.verification.step2List1')}</List.Item>
                    <List.Item>{t('tickets.verification.step2List2')}</List.Item>
                    <List.Item>{t('tickets.verification.step2List3')}</List.Item>
                  </List>
                </div>
              </Stack>
            </Stack>
          </Card>

          <Divider />

          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
              <Title order={2}>{t('tickets.verification.resourcesTitle')}</Title>
              <List spacing='sm'>
                <List.Item>
                  <Trans
                    i18nKey='tickets.verification.resource1'
                    components={{
                      1: (
                        <Anchor
                          href='https://api.random.org/json-rpc/4/signed'
                          target='_blank'
                          rel='noopener noreferrer'
                        />
                      ),
                    }}
                  />
                </List.Item>
                <List.Item>
                  <Trans
                    i18nKey='tickets.verification.resource2'
                    components={{
                      1: (
                        <Anchor
                          href='https://api.random.org/signatures/form'
                          target='_blank'
                          rel='noopener noreferrer'
                        />
                      ),
                    }}
                  />
                </List.Item>
              </List>
            </Stack>
          </Card>

          <Alert color='green' variant='light'>
            <Text size='sm'>{t('tickets.verification.conclusion')}</Text>
          </Alert>

          <Divider />

          <Card
            shadow='sm'
            padding='lg'
            radius='md'
            withBorder
            style={{ borderColor: 'var(--mantine-color-yellow-6)' }}
          >
            <Stack gap='md'>
              <Group gap='xs'>
                <Title order={2}>{t('tickets.verification.tbdTitle')}</Title>
                <Text c='yellow' fw={600} size='sm'>
                  (TBD)
                </Text>
              </Group>
              <Text c='dimmed'>{t('tickets.verification.tbdDescription')}</Text>
              <List spacing='sm'>
                <List.Item>
                  <Text>{t('tickets.verification.tbdItem1')}</Text>
                </List.Item>
              </List>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </PageContainer>
  );
};

export default TicketVerificationInstructionsPage;
