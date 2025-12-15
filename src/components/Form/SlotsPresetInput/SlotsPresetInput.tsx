import {
  Anchor,
  Button,
  Checkbox,
  Grid,
  Group,
  List,
  Modal,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import BlockIcon from '@mui/icons-material/Block';
import TaskIcon from '@mui/icons-material/Task';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { FC, ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { Slot } from '@models/slot.model.ts';
import { parseSlotsPreset } from '@utils/slots.utils.ts';
import classes from './SlotsPresetInput.module.css';

interface SlotsPresetInputProps {
  buttonTitle: string;
  onChange: (items: Slot[], saveSlots: boolean) => void;
  buttonClass?: string;
  dialogTitle?: ReactNode;
  hint?: ReactNode;
}

const SlotsPresetInput: FC<SlotsPresetInputProps> = ({ onChange, buttonTitle, buttonClass, dialogTitle, hint }) => {
  const { t } = useTranslation();
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const [saveSlots, setSaveSlots] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const toggleDialog = (): void => {
    setIsInputOpened((prevOpened) => !prevOpened);
  };

  const closeDialog = (): void => {
    setIsInputOpened(false);
    setManualInput('');
  };

  const handleFileUpload = ([file]: File[]): void => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        onChange(parseSlotsPreset(reader.result), saveSlots);
        closeDialog();
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSlotsChange = (event: any): void => {
    setSaveSlots(event.target.checked);
  };

  const submit = () => {
    onChange(parseSlotsPreset(manualInput), saveSlots);
    closeDialog();
  };

  const importRules = t('wheel.import.rules', { returnObjects: true }) as string[];

  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.settings.chapters.import);

  return (
    <div>
      <Modal
        opened={isInputOpened}
        onClose={toggleDialog}
        size='xxl'
        centered
        title={dialogTitle ?? t('wheel.import.title')}
      >
        <Grid align='flex-start' gutter='xl'>
          <Grid.Col span={5}>
            <Stack>
              <Title order={5}>{t('wheel.import.rulesTitle')}</Title>
              <List>
                {importRules.map((rule: string, index: number) => (
                  <List.Item key={index}>
                    <Text size='sm' c='dimmed'>
                      <Trans
                        i18nKey={`wheel.import.rules.${index}`}
                        components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' /> }}
                      />
                    </Text>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>
          <Grid.Col span={7}>
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
              <Textarea
                rows={14}
                placeholder={t('wheel.typeParticipants')}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <Group justify='space-between' align='center'>
                <Checkbox checked={saveSlots} onChange={handleSaveSlotsChange} label={t('wheel.addLotsToAuc')} />
                <Tooltip label={t('wheel.import.submitDisabled')} disabled={!!manualInput}>
                  <Button onClick={submit} disabled={!manualInput}>
                    {t('common.apply')}
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Modal>
      <Button variant='outline' onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default SlotsPresetInput;
