import { Alert, Anchor, Code, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

const LocalBasicTab = () => {
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
      <Alert color='blue' variant='light' title={t('wheel.randomnessModal.sources.localBasic.tldr')}>
        {t('wheel.randomnessModal.sources.localBasic.tldrText')}
      </Alert>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.localBasic.howItWorks')}
        </Title>
        <Text mb='sm'>{t('wheel.randomnessModal.sources.localBasic.explanation')}</Text>
        <Text mb='sm' c='dimmed' size='sm'>
          <Trans
            i18nKey='wheel.randomnessModal.sources.localBasic.pseudoRandomExplanation'
            components={{
              1: (
                <Anchor
                  href='https://en.wikipedia.org/wiki/Pseudorandom_number_generator'
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
            }}
          />
        </Text>
      </div>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.localBasic.implementation')}
        </Title>
        <Alert color='gray' p='md' radius='md' variant='light'>
          <Code block>{`// generates random number in range [0, 1)
const getRandomValue = (): number => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;`}</Code>
        </Alert>
        <Text size='sm' c='dimmed' mt='xs'>
          <Trans
            i18nKey='wheel.randomnessModal.sources.localBasic.codeSource'
            components={{
              1: (
                <Anchor
                  href='https://github.com/Pointauc/pointauc_frontend/blob/master/src/utils/common.utils.ts#L115'
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
            }}
          />
        </Text>
      </div>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.localBasic.verification')}
        </Title>
        <Text mb='sm'>{t('wheel.randomnessModal.sources.localBasic.verificationText')}</Text>
        <Text size='sm' c='dimmed'>
          <Trans
            i18nKey='wheel.randomnessModal.sources.localBasic.verificationLink'
            components={{
              1: (
                <Anchor
                  href='https://github.com/Pointauc/pointauc_frontend?tab=readme-ov-file#-authenticity-verification'
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
        [
          t('wheel.randomnessModal.sources.localBasic.pro1'),
          t('wheel.randomnessModal.sources.localBasic.pro2'),
          t('wheel.randomnessModal.sources.localBasic.pro3'),
        ],
        [t('wheel.randomnessModal.sources.localBasic.con1'), t('wheel.randomnessModal.sources.localBasic.con2')],
      )}
    </Stack>
  );
};

export default LocalBasicTab;

