import { Accordion, Alert, Box, Button, Group, Modal, Stack, Stepper, Table, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import overlayInstructionCreateNew from '@assets/img/overlay-instruction-create-new.png';
import overlayInstructionNewVariantSelection from '@assets/img/overlay-instruction-new-variant-selection.png';
import overlayInstructionGetALink from '@assets/img/overlay-instruction-get-a-link.png';
import overlayInstructionAddNewSource from '@assets/img/overlay-instruction-add-new-source.png';
import overlayInstructionSourceProperties from '@assets/img/overlay-instruction-source-properties.png';

import styles from './InstructionsModal.module.css';

interface InstructionsModalProps {
  opened: boolean;
  onClose: () => void;
}

const InstructionsModal: FC<InstructionsModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const instructionsContentRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (activeStep < 1) {
      setActiveStep(activeStep + 1);
      if (instructionsContentRef.current) {
        instructionsContentRef.current.scrollTop = 0;
      }
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      if (instructionsContentRef.current) {
        instructionsContentRef.current.scrollTop = 0;
      }
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size='xl'
      centered
      title={t('overlays.instructions.title')}
      classNames={{ content: styles.modalContent, body: styles.modalBody }}
    >
      <Stack gap='lg'>
        <Stepper active={activeStep} size='sm'>
          <Stepper.Step label={t('overlays.instructions.step1Title')} />
          <Stepper.Step label={t('overlays.instructions.step2Title')} />
        </Stepper>

        <div ref={instructionsContentRef} className={styles.instructionsContent}>
          {activeStep === 0 && (
            <Stack gap='md'>
              <Alert color='blue' icon={<IconAlertCircle size={16} />}>
                {t('overlays.instructions.helpButtonHint')}
              </Alert>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.listPageTitle')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.listPageDescription')}
                </Text>
                <Box className={styles.screenshotContainer}>
                  <img
                    src={overlayInstructionCreateNew}
                    alt={t('overlays.instructions.listPageTitle')}
                    className={styles.screenshot}
                  />
                </Box>
              </Box>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.createOverlayTitle')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.createOverlayDescription')}
                </Text>
                <Box className={styles.screenshotContainer}>
                  <img
                    src={overlayInstructionNewVariantSelection}
                    alt={t('overlays.instructions.createOverlayTitle')}
                    className={styles.screenshot}
                  />
                </Box>
              </Box>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.editPageTitle')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.editPageDescription')}
                </Text>

                <Stack gap='sm' mt='md'>
                  <Box>
                    <Text size='sm' fw={500}>
                      {t('overlays.instructions.settingsPanelTitle')}
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {t('overlays.instructions.settingsPanelDescription')}
                    </Text>
                  </Box>

                  <Box>
                    <Text size='sm' fw={500}>
                      {t('overlays.instructions.previewPanelTitle')}
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {t('overlays.instructions.previewPanelDescription')}
                    </Text>
                  </Box>
                </Stack>

                <Accordion variant='contained' mt='md'>
                  <Accordion.Item value='details'>
                    <Accordion.Control>{t('overlays.instructions.moreDetails')}</Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap='xs'>
                        <Text size='sm' c='dimmed'>
                          {t('overlays.instructions.detailsContent1')}
                        </Text>
                        <Text size='sm' c='dimmed'>
                          {t('overlays.instructions.detailsContent2')}
                        </Text>
                        <Text size='sm' c='dimmed'>
                          {t('overlays.instructions.detailsContent3')}
                        </Text>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Box>
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack gap='md'>
              <Alert color='red' icon={<IconAlertCircle size={16} />} title={t('overlays.instructions.important')}>
                {t('overlays.instructions.obsWarning')}
              </Alert>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.obsStep1Title')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.obsStep1Description')}
                </Text>
                <Box className={styles.screenshotContainer}>
                  <img
                    src={overlayInstructionGetALink}
                    alt={t('overlays.instructions.obsStep1Title')}
                    className={styles.screenshot}
                  />
                </Box>
              </Box>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.obsStep2Title')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.obsStep2Description')}
                </Text>
                <Box className={styles.screenshotContainer}>
                  <img
                    src={overlayInstructionAddNewSource}
                    alt={t('overlays.instructions.obsStep2Title')}
                    className={styles.screenshot}
                  />
                </Box>
              </Box>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.obsSettingsTitle')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.obsSettingsDescription')}
                </Text>
                <Table striped highlightOnHover withTableBorder className={styles.settingsTable}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('overlays.instructions.settingName')}</Table.Th>
                      <Table.Th>{t('overlays.instructions.settingValue')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>URL</Table.Td>
                      <Table.Td>{t('overlays.instructions.yourOverlayLink')}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Width</Table.Td>
                      <Table.Td>1920 ({t('overlays.instructions.orStreamWidth')})</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Height</Table.Td>
                      <Table.Td>1080 ({t('overlays.instructions.orStreamHeight')})</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{t('overlays.instructions.shutdownWhenNotVisible')}</Table.Td>
                      <Table.Td>✅</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>{t('overlays.instructions.refreshWhenActive')}</Table.Td>
                      <Table.Td>✅</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>

                <Box className={styles.screenshotContainer}>
                  <img
                    src={overlayInstructionSourceProperties}
                    alt={t('overlays.instructions.obsSettingsTitle')}
                    className={styles.screenshot}
                  />
                </Box>
              </Box>

              <Box>
                <Title order={4} mb='sm'>
                  {t('overlays.instructions.finalStepTitle')}
                </Title>
                <Text size='sm' mb='xs'>
                  {t('overlays.instructions.finalStepDescription')}
                </Text>

                <Accordion variant='contained' mt='md'>
                  <Accordion.Item value='advanced'>
                    <Accordion.Control>{t('overlays.instructions.advancedTips')}</Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap='xs'>
                        <Text size='sm' c='dimmed'>
                          {t('overlays.instructions.advancedTip1')}
                        </Text>
                        <Text size='sm' c='dimmed'>
                          {t('overlays.instructions.advancedTip2')}
                        </Text>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Box>
            </Stack>
          )}
        </div>

        <Group justify='space-between'>
          <Button variant='default' onClick={handleBack} disabled={activeStep === 0}>
            {t('overlays.instructions.back')}
          </Button>
          <Button onClick={handleNext}>
            {activeStep === 1 ? t('overlays.instructions.finish') : t('overlays.instructions.next')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default InstructionsModal;
