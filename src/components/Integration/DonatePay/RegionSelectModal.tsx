import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, Group, Modal, PasswordInput, Stack, Stepper, Text, TextInput, Title } from '@mantine/core';

import withLoading from '@decorators/withLoading.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { donatePayRuControllerAuthorize, donatePayEuControllerAuthorize } from '@api/openapi/sdk.gen.ts';

import { DonatePayRegion, DONATE_PAY_REGIONS } from './types.ts';
import classes from './index.module.css';

interface RegionSelectModalProps {
  opened: boolean;
  onClose: () => void;
}

const REGION_API_URLS: Record<DonatePayRegion, string> = {
  ru: 'https://donatepay.ru/page/api',
  eu: 'https://donatepay.eu/page/api',
};

function RegionSelectModal({ opened, onClose }: RegionSelectModalProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<DonatePayRegion | null>(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRedirectWarning, setShowRedirectWarning] = useState(false);

  const handleRegionSelect = (region: DonatePayRegion) => {
    setSelectedRegion(region);
  };

  const handleNextStep = () => {
    if (selectedRegion) {
      setActiveStep(1);
    }
  };

  const handlePrevStep = () => {
    setActiveStep(0);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedRegion(null);
    setToken('');
    setShowRedirectWarning(false);
    onClose();
  };

  const handleAuthorize = async () => {
    if (!selectedRegion || !token) return;

    await withLoading(setIsLoading, async () => {
      const regionConfig = DONATE_PAY_REGIONS[selectedRegion];
      const authenticateFn = selectedRegion === 'eu' ? donatePayEuControllerAuthorize : donatePayRuControllerAuthorize;

      await authenticateFn({ body: { accessToken: token } });
      integrationUtils.storage.set(regionConfig.integrationId, 'authToken', token);
      await loadUserData(dispatch);
      handleClose();
    })();
  };

  const handleLinkClick = () => {
    setShowRedirectWarning(true);
  };

  const apiUrl = selectedRegion ? REGION_API_URLS[selectedRegion] : '';

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        size='lg'
        title={
          activeStep === 0 ? t('integration.donatePay.regionSelect.title') : t('integration.donatePay.tokenModal.title')
        }
      >
        <Stack gap='lg'>
          <Stepper active={activeStep} size='sm'>
            <Stepper.Step label={t('integration.donatePay.regionSelect.steps.region')} />
            <Stepper.Step label={t('integration.donatePay.regionSelect.steps.token')} />
          </Stepper>

          {activeStep === 0 && (
            <Stack gap='md'>
              <Text size='sm' c='dimmed'>
                {t('integration.donatePay.regionSelect.description')}
              </Text>

              <Stack gap='sm'>
                <div
                  className={classes.regionCard}
                  data-selected={selectedRegion === 'ru'}
                  onClick={() => handleRegionSelect('ru')}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegionSelect('ru')}
                >
                  <Text className={classes.regionTitle}>{t('integration.donatePay.regionSelect.ru.title')}</Text>
                  <Text className={classes.regionDescription}>
                    {t('integration.donatePay.regionSelect.ru.description')}
                  </Text>
                </div>

                <div
                  className={classes.regionCard}
                  data-selected={selectedRegion === 'eu'}
                  onClick={() => handleRegionSelect('eu')}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegionSelect('eu')}
                >
                  <Text className={classes.regionTitle}>{t('integration.donatePay.regionSelect.eu.title')}</Text>
                  <Text className={classes.regionDescription}>
                    {t('integration.donatePay.regionSelect.eu.description')}
                  </Text>
                </div>
              </Stack>

              <Group justify='flex-end'>
                <Button onClick={handleNextStep} disabled={!selectedRegion}>
                  {t('common.apply')}
                </Button>
              </Group>
            </Stack>
          )}

          {activeStep === 1 && selectedRegion && (
            <Stack gap='md'>
              <Text c='dimmed' size='sm'>
                {t('integration.donatePay.tokenModal.description')}
              </Text>

              <Text c='dimmed' size='sm'>
                {t('integration.donatePay.tokenModal.privacy')}
              </Text>

              <Title order={4} ta='center'>
                {t('integration.donatePay.tokenModal.apiKeyTitle')}
              </Title>

              <Text className={classes.warningText}>{t('integration.donatePay.tokenModal.warning')}</Text>

              <Text size='sm'>
                <Trans
                  i18nKey='integration.donatePay.tokenModal.instructions'
                  values={{ url: apiUrl }}
                  components={{
                    1: <span className={classes.instructionsLink} onClick={handleLinkClick} />,
                  }}
                />
              </Text>

              <PasswordInput
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder='API Key'
                classNames={{ input: classes.tokenInput }}
                autoComplete='off'
              />

              <Group justify='space-between'>
                <Button variant='default' onClick={handlePrevStep}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAuthorize} loading={isLoading} disabled={!token}>
                  {t('common.apply')}
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Modal>

      <Modal opened={showRedirectWarning} onClose={() => setShowRedirectWarning(false)} size='sm'>
        <Stack gap='md'>
          <Text c='red'>{t('integration.donatePay.tokenModal.confirmHideScreen')}</Text>
          <Group justify='flex-end'>
            <Button
              component='a'
              href={apiUrl}
              target='_blank'
              rel='noopener noreferrer'
              variant='outline'
              onClick={() => setShowRedirectWarning(false)}
            >
              {t('integration.donatePay.tokenModal.hiddenConfirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default RegionSelectModal;
