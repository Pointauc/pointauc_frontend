import {
  Alert,
  Anchor,
  Box,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  List,
  Paper,
  Stack,
  TableOfContents,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight, IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
import { useLayoutEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import LotteryAnalogy from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/LotteryAnalogy';
import PrerequisitesAlert from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/PrerequisitesAlert/PrerequisitesAlert';

const TOC_HEADING_SCROLL_MARGIN = { scrollMarginTop: '2rem' } as const;

const TICKET_VERIFICATION_TOC_SELECTOR = '#ticket-verification-content :is(h1, h2)';

const TOC_SHORT_LABEL_KEYS: Record<string, string> = {
  'ticket-verification-title': 'tickets.verification.toc.page',
  'ticket-verification-flow': 'tickets.verification.toc.flow',
  'ticket-verification-analogy': 'tickets.verification.toc.analogy',
  'ticket-verification-steps': 'tickets.verification.toc.steps',
  'ticket-verification-record-structure': 'tickets.verification.toc.recordStructure',
  'ticket-verification-resources': 'tickets.verification.toc.resources',
  'ticket-verification-tbd': 'tickets.verification.toc.tbd',
};

const TicketVerificationInstructionsPage = () => {
  const { t, i18n } = useTranslation();
  const [analogyOpened, { toggle: toggleAnalogy }] = useDisclosure(false);
  const tocReinitializeRef = useRef(() => {});
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    tocReinitializeRef.current();
  }, [i18n.language]);

  return (
    <PageContainer contentId='ticket-verification-content' contentRef={contentRef}>
      <Container size='xl' py='xl'>
        <Flex justify='center' align='flex-start' gap='md' direction={{ base: 'column', lg: 'row' }}>
          <Box
            visibleFrom='lg'
            component='nav'
            aria-label={t('tickets.verification.tableOfContentsLabel')}
            style={{
              position: 'sticky',
              top: 'var(--mantine-spacing-md)',
              alignSelf: 'flex-start',
              width: '14rem',
              flexShrink: 0,
              overflowY: 'auto',
              zIndex: 1,
            }}
          >
            <Stack gap={4}>
              <Text size='sm' fw={600} c='dimmed'>
                {t('tickets.verification.tableOfContentsLabel')}
              </Text>
              <TableOfContents
                variant='light'
                color='blue'
                size='sm'
                radius='sm'
                reinitializeRef={tocReinitializeRef}
                scrollSpyOptions={{
                  selector: TICKET_VERIFICATION_TOC_SELECTOR,
                  scrollHost: contentRef.current ?? undefined,
                  offset: 24,
                  getValue: (element) => {
                    const labelKey = TOC_SHORT_LABEL_KEYS[element.id];
                    return labelKey ? t(labelKey) : element.textContent ?? '';
                  },
                }}
                getControlProps={({ data }) => ({
                  onClick: () => data.getNode().scrollIntoView({ behavior: 'smooth', block: 'start' }),
                  children: data.value,
                  fz: 'sm',
                  py: 4,
                })}
              />
            </Stack>
          </Box>

          <Box style={{ flex: '1 1 0', minWidth: 0 }}>
            <Container size='md'>
              <Box>
                <Stack gap='lg' pb='md'>
                  <Group justify='space-between' align='center'>
                    <Title order={1} id='ticket-verification-title' style={TOC_HEADING_SCROLL_MARGIN}>
                      {t('tickets.verification.title')}
                    </Title>
                    <IconShieldCheck size={48} color='var(--mantine-color-blue-6)' />
                  </Group>

                  <Alert icon={<IconInfoCircle size={20} />} color='blue' variant='light'>
                    {t('tickets.verification.introduction')}
                  </Alert>

                  <PrerequisitesAlert />

                  <Card shadow='sm' padding='lg' radius='md' withBorder>
                    <Stack gap='md'>
                      <Title order={2} id='ticket-verification-flow' style={TOC_HEADING_SCROLL_MARGIN}>
                        {t('tickets.verification.flowTitle')}
                      </Title>
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

                  <Card
                    shadow='sm'
                    padding='lg'
                    radius='md'
                    withBorder
                    onClick={toggleAnalogy}
                    style={{ cursor: 'pointer' }}
                    aria-expanded={analogyOpened}
                  >
                    <Stack gap='sm'>
                      <Stack gap='0'>
                        <Group justify='space-between' align='center' wrap='nowrap'>
                          <Group gap='xs' align='center' wrap='nowrap' flex={1} miw={0} style={{ userSelect: 'none' }}>
                            {analogyOpened ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                            <Title order={2} id='ticket-verification-analogy' style={TOC_HEADING_SCROLL_MARGIN}>
                              {t('tickets.verification.analogyTitle')}
                            </Title>
                          </Group>
                        </Group>

                        <Text size='sm' c='dimmed'>
                          {t('tickets.verification.analogyDescription')}
                        </Text>
                      </Stack>

                      <Collapse expanded={analogyOpened} keepMounted>
                        <Box onClick={(event) => event.stopPropagation()} style={{ cursor: 'default' }}>
                          <LotteryAnalogy showTitle={false} />
                        </Box>
                      </Collapse>
                    </Stack>
                  </Card>

                  <Divider />

                  <Card shadow='sm' padding='lg' radius='md' withBorder>
                    <Stack gap='md'>
                      <Title order={2} id='ticket-verification-steps' style={TOC_HEADING_SCROLL_MARGIN}>
                        {t('tickets.verification.verificationStepsTitle')}
                      </Title>
                      <Text>{t('tickets.verification.verificationStepsIntro')}</Text>

                      <Stack gap='lg' mt='md'>
                        <div>
                          <Title order={3} mb='sm' id='ticket-verification-step-1' style={TOC_HEADING_SCROLL_MARGIN}>
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
                                      key='random-org-signature-form'
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
                          <Title order={3} mb='sm' id='ticket-verification-step-2' style={TOC_HEADING_SCROLL_MARGIN}>
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
                                    key='prediction-service-source'
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
                      <Title order={2} id='ticket-verification-record-structure' style={TOC_HEADING_SCROLL_MARGIN}>
                        {t('tickets.verification.recordStructureTitle')}
                      </Title>
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
                      <Title order={2} id='ticket-verification-resources' style={TOC_HEADING_SCROLL_MARGIN}>
                        {t('tickets.verification.resourcesTitle')}
                      </Title>
                      <List spacing='sm'>
                        <List.Item>
                          <Trans
                            i18nKey='tickets.verification.resource1'
                            components={{
                              1: (
                                <Anchor
                                  key='random-org-signed-api'
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
                                  key='random-org-signatures-resource'
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
                        <Title order={2} id='ticket-verification-tbd' style={TOC_HEADING_SCROLL_MARGIN}>
                          {t('tickets.verification.tbdTitle')}
                        </Title>
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
              </Box>
            </Container>
          </Box>
        </Flex>
      </Container>
    </PageContainer>
  );
};

export default TicketVerificationInstructionsPage;
