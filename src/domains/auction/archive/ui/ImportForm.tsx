import { Button, Code, Collapse, Grid, Group, List, Stack, Tabs, Text, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import BlockIcon from '@mui/icons-material/Block';
import TaskIcon from '@mui/icons-material/Task';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { t } from 'i18next';
import { useState } from 'react';
import { Trans } from 'react-i18next';

import { parseLotsImportFile } from '@utils/slots.utils';

import { parseCSV } from '../lib/csvParser';
import { ArchiveData } from '../model/types';

import styles from './ImportForm.module.css';
import ManualImport from './ManualImport';

interface ImportFormProps {
  onImport: (data: ArchiveData, file?: File) => void;
  extraControls?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

const ImportForm = ({ onImport, extraControls, layout = 'vertical' }: ImportFormProps) => {
  const [formatTab, setFormatTab] = useState<string | null>('csv');
  const [showManualImport, setShowManualImport] = useState<boolean>(false);

  const handleFileUpload = (files: File[]) => {
    if (files[0]) {
      parseLotsImportFile(files[0]).then((data) => {
        onImport({ lots: data }, files[0]);
      });
    }
  };

  const handleManualImportSubmit = (manualInput: string) => {
    onImport({ lots: parseCSV(manualInput) });
  };

  return (
    <Grid align='flex-start' gutter={layout === 'horizontal' ? 'xl' : 'sm'}>
      <Grid.Col span={layout === 'horizontal' ? 5 : 12} order={layout === 'horizontal' ? 0 : 1}>
        <Stack>
          <Title order={5} fw={400}>
            {t('archive.import.formats.title')}
          </Title>

          <Tabs value={formatTab} onChange={setFormatTab}>
            <Tabs.List>
              <Tabs.Tab value='csv'>{t('archive.import.formats.csv.tab')}</Tabs.Tab>
              <Tabs.Tab value='json'>{t('archive.import.formats.json.tab')}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='csv' pt='md'>
              <Stack gap='md'>
                <Text size='sm' c='dimmed'>
                  <Trans
                    i18nKey='archive.import.formats.csv.description'
                    components={{
                      li: <List.Item fz='sm' />,
                      ul: <List />,
                    }}
                  />
                </Text>

                <div>
                  <Text size='sm' fw={500} mb='xs'>
                    {t('archive.import.formats.csv.exampleTitle')}
                  </Text>
                  <Code block className={styles.codeBlock}>
                    {t('archive.import.formats.csv.example')}
                  </Code>
                </div>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value='json' pt='md'>
              <Stack gap='md'>
                <Text size='sm'>
                  <Trans
                    i18nKey='archive.import.formats.json.description'
                    components={{
                      a: <a href='https://en.wikipedia.org/wiki/JSON' target='_blank' rel='noopener noreferrer' />,
                    }}
                  />
                </Text>

                <div>
                  <Text size='sm' fw={500} mb='xs'>
                    {t('archive.import.formats.json.structureTitle')}
                  </Text>
                  <Code block className={styles.codeBlock}>
                    {t('archive.import.formats.json.structure')}
                  </Code>
                </div>

                <div>
                  <Text size='sm' fw={500} mb='xs'>
                    {t('archive.import.formats.json.exampleTitle')}
                  </Text>
                  <Code block className={styles.codeBlock}>
                    {t('archive.import.formats.json.example')}
                  </Code>
                </div>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Grid.Col>
      <Grid.Col span={layout === 'horizontal' ? 7 : 12} order={layout === 'horizontal' ? 1 : 0}>
        <Stack gap='md'>
          <Dropzone onDrop={handleFileUpload}>
            <Group justify='center' gap='xl' mih={100} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <TaskIcon />
              </Dropzone.Accept>
              <Dropzone.Idle>
                <UploadFileIcon />
              </Dropzone.Idle>
              <Dropzone.Reject>
                <BlockIcon />
              </Dropzone.Reject>
              <div>
                <Text size='lg' inline>
                  {t('common.moveFileOrClick')}
                </Text>
              </div>
            </Group>
          </Dropzone>
          {layout === 'horizontal' && <ManualImport onSubmit={handleManualImportSubmit} />}
          {layout === 'vertical' && (
            <>
              <Button size='sm' variant='transparent' onClick={() => setShowManualImport(!showManualImport)}>
                {t('archive.import.manual')}
              </Button>
              <Collapse in={showManualImport}>
                <ManualImport onSubmit={handleManualImportSubmit} />
              </Collapse>
            </>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default ImportForm;
