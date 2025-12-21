import { Alert, Button, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import ROUTES from '@constants/routes.constants';
import PrerequisitesAlert from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/PrerequisitesAlert/PrerequisitesAlert';

import LotteryAnalogy from './LotteryAnalogy';

interface RandomOrgSignedTabProps {
  onViewTechnicalDetails: () => void;
}

const RandomOrgSignedTab = ({ onViewTechnicalDetails }: RandomOrgSignedTabProps) => {
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
      <Alert color='blue' variant='light' title={t('wheel.randomnessModal.sources.randomOrgSigned.tldr')}>
        {t('wheel.randomnessModal.sources.randomOrgSigned.tldrText')}
      </Alert>

      <div>
        <LotteryAnalogy />
      </div>

      <div>
        <Title order={3} size='h4' mb='sm'>
          {t('wheel.randomnessModal.sources.randomOrgSigned.technicalDetails')}
        </Title>
        <Text mb='sm'>{t('wheel.randomnessModal.sources.randomOrgSigned.technicalDetailsText')}</Text>
        <Button variant='light' component='a' href={ROUTES.TICKET_VERIFICATION_INFO} target='_blank'>
          {t('wheel.randomnessModal.sources.randomOrgSigned.viewTechnicalButton')}
        </Button>
      </div>

      <Divider />

      <PrerequisitesAlert />

      <Divider />

      {renderProsConsTable(
        [
          t('wheel.randomnessModal.sources.randomOrgSigned.pro1'),
          t('wheel.randomnessModal.sources.randomOrgSigned.pro2'),
        ],
        [
          t('wheel.randomnessModal.sources.randomOrgSigned.con1'),
          t('wheel.randomnessModal.sources.randomOrgSigned.con2'),
        ],
      )}
    </Stack>
  );
};

export default RandomOrgSignedTab;
