import { Alert, Anchor, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

const RandomOrgTab = () => {
  const { t } = useTranslation();

  const renderProsConsTable = (pros: string[], cons: string[]) => (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Group gap='xs'>
              <IconCheck size={16} color='var(--mantine-color-green-6)' />
              <Text fw={600}>{t('wheel.randomnessModal.pros')}</Text>
            </Group>
          </Table.Th>
          <Table.Th>
            <Group gap='xs'>
              <IconX size={16} color='var(--mantine-color-red-6)' />
              <Text fw={600}>{t('wheel.randomnessModal.cons')}</Text>
            </Group>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Math.max(pros.length, cons.length) > 0 &&
          Array.from({ length: Math.max(pros.length, cons.length) }).map((_, index) => (
            <Table.Tr key={index}>
              <Table.Td>{pros[index] || ''}</Table.Td>
              <Table.Td>{cons[index] || ''}</Table.Td>
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
  );

  return (
    <Stack gap='lg'>
      <Alert color='blue' variant='light' title={t('wheel.randomnessModal.sources.randomOrg.tldr')}>
        {t('wheel.randomnessModal.sources.randomOrg.tldrText')}
      </Alert>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.randomOrg.whatIsIt')}
        </Title>
        <Text mb='sm'>{t('wheel.randomnessModal.sources.randomOrg.whatIsItText')}</Text>
        <Text mb='sm' c='dimmed' size='sm'>
          <Trans
            i18nKey='wheel.randomnessModal.sources.randomOrg.howItGenerates'
            components={{
              1: <Anchor href='https://www.random.org/randomness/' target='_blank' rel='noopener noreferrer' />,
            }}
          />
        </Text>
      </div>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.randomOrg.implementation')}
        </Title>
        <Text mb='sm'>{t('wheel.randomnessModal.sources.randomOrg.implementationText')}</Text>
        <Text size='sm' c='dimmed'>
          <Trans
            i18nKey='wheel.randomnessModal.sources.randomOrg.apiSource'
            components={{
              1: (
                <Anchor
                  href='https://github.com/Pointauc/pointauc_frontend/blob/master/src/api/randomApi.ts'
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
            }}
          />
        </Text>
      </div>

      <Divider />

      {renderProsConsTable(
        [t('wheel.randomnessModal.sources.randomOrg.pro1'), t('wheel.randomnessModal.sources.randomOrg.pro2')],
        [
          t('wheel.randomnessModal.sources.randomOrg.con1'),
          t('wheel.randomnessModal.sources.randomOrg.con2'),
          t('wheel.randomnessModal.sources.randomOrg.con3'),
        ],
      )}
    </Stack>
  );
};

export default RandomOrgTab;

