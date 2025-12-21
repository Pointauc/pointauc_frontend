import { Alert, Anchor, Button, Group, Select, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { IconAlertCircle } from '@tabler/icons-react';

import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';
import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { WheelFormat } from '@constants/wheel.ts';
import ClassicDropoutDescription from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/ClassicDropoutDescription';
import SplitField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/Split';
import WheelFormatField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/WheelFormat';
import TicketCard from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/TicketCard/TicketCard';
import RandomnessExplanationModal from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/RandomnessExplanationModal';

import { DropoutVariant } from '../../../BaseWheel/BaseWheel';
import { DropoutHelp } from '../../../Dropout/ui/DropoutHelp';
import NewDropoutDescription from '../../../Dropout/ui/NewDropoutDescription/NewDropoutDescription';
import CoreImageField from '../Fields/CoreImageExpandPanel/CoreImage';
import DropoutFormatField from '../Fields/DropoutFormat';
import RandomSpinConfig from '../Fields/RandomSpinConfig';
import RandomSpinSwitch from '../Fields/RandomSpinSwitch';
import SpinTimeField from '../Fields/SpinTime';
import WheelStyleSelect from '../Fields/StyleSelect/StyleSelect';
import { RevealedData } from '../../../lib/hooks/useTicketManagement';

interface WheelSettingsProps {
  nextWinner?: string;
  isLoadingSeed: boolean;
  controls: Wheel.SettingControls;
  children: ReactNode;
  renderSubmitButton?: (defaultButton: ReactNode) => ReactNode;
  direction?: 'row' | 'column';
  ticketData?: RevealedData | null;
  availableQuota?: number | null;
  isCreatingTicket?: boolean;
  ticketError?: Error | null;
}

const WheelSettings = (props: WheelSettingsProps) => {
  const {
    isLoadingSeed,
    direction = 'column',
    controls,
    children,
    renderSubmitButton,
    ticketData,
    isCreatingTicket,
    availableQuota,
    ticketError,
  } = props;
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });
  const randomSpinEnabled = useWatch<Wheel.Settings>({ name: 'randomSpinEnabled' });
  const randomnessSource = useWatch<Wheel.Settings>({ name: 'randomnessSource' });
  const [randomnessModalOpened, setRandomnessModalOpened] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<'local-basic' | 'random-org' | 'random-org-signed'>();

  const MODAL_OPENED_KEY = 'randomnessModalHasBeenOpened';

  // Auto-open modal for random-org-signed if it hasn't been opened before
  useEffect(() => {
    if (randomnessSource === 'random-org-signed') {
      const hasBeenOpened = localStorage.getItem(MODAL_OPENED_KEY);
      if (!hasBeenOpened) {
        setInitialModalTab('random-org-signed');
        setRandomnessModalOpened(true);
        localStorage.setItem(MODAL_OPENED_KEY, 'true');
      }
    }
  }, [randomnessSource]);

  // Auto-reset randomnessSource to 'local-basic' for restricted wheel types
  useEffect(() => {
    const isRestrictedWheel =
      format === WheelFormat.BattleRoyal ||
      (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

    if (isRestrictedWheel && randomnessSource !== 'local-basic') {
      setValue('randomnessSource', 'local-basic');
    }
  }, [format, dropoutVariant, randomnessSource, setValue]);

  const submitButton = (
    <Button loading={isLoadingSeed || isCreatingTicket} disabled={isSubmitting} variant='contained' type='submit'>
      {isSubmitting ? t('wheel.spinning') : t('wheel.spin')}
    </Button>
  );

  const isRestrictedWheel =
    format === WheelFormat.BattleRoyal || (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

  const randomnessOptions = [
    { value: 'local-basic', label: t('wheel.randomnessSource.localBasic') },
    { value: 'random-org', label: t('wheel.randomnessSource.randomOrg'), disabled: isRestrictedWheel },
    {
      value: 'random-org-signed',
      label: t('wheel.randomnessSource.randomOrgSigned'),
      disabled: isRestrictedWheel,
    },
  ];

  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.settings.page);

  const ticketErrorMessage = useMemo(() => {
    if (randomnessSource !== 'random-org-signed' || !ticketError) return null;
    if (randomnessSource === 'random-org-signed' && (ticketError as AxiosError)?.status === 403) {
      return t('wheel.ticket.unauthorizedError');
    }
    return t('wheel.ticket.unknownError');
  }, [ticketError, randomnessSource, t]);

  const handleOpenRandomnessModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInitialModalTab(undefined);
    setRandomnessModalOpened(true);
  };

  const handleCloseModal = () => {
    setRandomnessModalOpened(false);
    setInitialModalTab(undefined);
  };

  return (
    <>
      <FirstTimeHelpNotification
        featureKey='wheelSettingsHelpSeen'
        title={t('wheel.helpNotification.title')}
        message={
          <Trans
            i18nKey='wheel.helpNotification.message'
            components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' />, 2: <b /> }}
          />
        }
      />
      <SimpleGrid cols={direction === 'row' ? 2 : 1} spacing='md' style={{ minHeight: 0 }}>
        <Stack gap='sm' mih={0}>
          <Group align='center' justify='space-between'>
            <Group gap='xs'>
              {renderSubmitButton ? renderSubmitButton(submitButton) : submitButton}
              <Group>
                {!randomSpinEnabled && <SpinTimeField />}
                {randomSpinEnabled && <RandomSpinConfig />}
              </Group>
            </Group>
            <RandomSpinSwitch />
          </Group>
          <Stack gap='sm' style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <WheelStyleSelect />
            <Stack gap='xxs'>
              {controls.mode && <WheelFormatField />}
              {format === WheelFormat.Dropout && (
                <>
                  <DropoutFormatField />
                  <DropoutHelp />
                  {dropoutVariant === DropoutVariant.New && <NewDropoutDescription />}
                  {dropoutVariant === DropoutVariant.Classic && <ClassicDropoutDescription />}
                </>
              )}
            </Stack>
            {children}
            {controls.split && <SplitField />}
            {controls.randomOrg && (
              <>
                <Controller
                  name='randomnessSource'
                  render={({ field: { value, onChange } }) => (
                    <Tooltip
                      label={t('wheel.randomnessSource.disabledTooltip')}
                      disabled={!isRestrictedWheel}
                      withArrow
                    >
                      <Select
                        label={
                          <Group gap='xs' justify='space-between' wrap='nowrap' w={'100%'}>
                            <Text>{t('wheel.randomnessSource.label')}</Text>
                            <Anchor size='sm' onClick={handleOpenRandomnessModal} style={{ whiteSpace: 'nowrap' }}>
                              {t('wheel.randomnessSource.learnMore')}
                            </Anchor>
                          </Group>
                        }
                        value={value}
                        onChange={(val) => onChange(val)}
                        data={randomnessOptions}
                        disabled={isSubmitting}
                        allowDeselect={false}
                      />
                    </Tooltip>
                  )}
                />
                {randomnessSource === 'random-org-signed' && ticketData && (
                  <TicketCard
                    ticketId={ticketData.ticketId}
                    createdAt={ticketData.createdAt}
                    revealedAt={ticketData?.revealedAt}
                    randomNumber={ticketData?.randomNumber}
                    availableQuota={availableQuota}
                  />
                )}
                {ticketErrorMessage && (
                  <Alert icon={<IconAlertCircle size={20} />} title={t('wheel.ticket.errorTitle')} color='red'>
                    {ticketErrorMessage}
                  </Alert>
                )}
              </>
            )}
            {/*{elements.randomPace && (*/}
            {/*  <>*/}
            {/*    <div className='wheel-controls-row'>*/}
            {/*      <Typography>{t('wheel.spicyFinal')}</Typography>*/}
            {/*      <Switch onChange={handleIsRandomPaceChange} />*/}
            {/*    </div>*/}
            {/*    {isRandomPace && (*/}
            {/*      <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />*/}
            {/*    )}*/}
            {/*  </>*/}
            {/*)}*/}
          </Stack>
        </Stack>
        <div style={{ display: 'flex', minHeight: 0, flexDirection: 'column' }}>
          <CoreImageField />
        </div>
      </SimpleGrid>
      <RandomnessExplanationModal
        opened={randomnessModalOpened}
        onClose={handleCloseModal}
        initialTab={initialModalTab}
      />
    </>
  );
};

export default WheelSettings;
