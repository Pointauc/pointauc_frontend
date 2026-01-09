import { Button, Group, Stack, Tabs } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import LocalBasicTab from './LocalBasicTab';
import RandomOrgTab from './RandomOrgTab';
import RandomOrgSignedTab from './RandomOrgSignedTab';

type RandomnessSource = 'local-basic' | 'random-org' | 'random-org-signed';

interface SourcesViewProps {
  activeTab: RandomnessSource;
  onTabChange: (tab: RandomnessSource) => void;
  onBackToIntro: () => void;
  onViewTechnicalDetails: () => void;
}

const SourcesView = ({ activeTab, onTabChange, onBackToIntro, onViewTechnicalDetails }: SourcesViewProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap='md'>
      <Group>
        <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onBackToIntro}>
          {t('wheel.randomnessModal.sources.backToIntro')}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => onTabChange(value as RandomnessSource)}>
        <Tabs.List>
          <Tabs.Tab value='local-basic'>{t('wheel.randomnessSource.localBasic')}</Tabs.Tab>
          <Tabs.Tab value='random-org'>{t('wheel.randomnessSource.randomOrg')}</Tabs.Tab>
          <Tabs.Tab value='random-org-signed'>{t('wheel.randomnessSource.randomOrgSigned')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='local-basic' pt='md'>
          <LocalBasicTab />
        </Tabs.Panel>
        <Tabs.Panel value='random-org' pt='md'>
          <RandomOrgTab />
        </Tabs.Panel>
        <Tabs.Panel value='random-org-signed' pt='md'>
          <RandomOrgSignedTab onViewTechnicalDetails={onViewTechnicalDetails} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default SourcesView;

