import { Anchor, Button, Group, SimpleGrid, Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';
import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { WheelFormat } from '@constants/wheel.ts';
import ClassicDropoutDescription from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/ClassicDropoutDescription';
import SplitField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/Split';
import WheelFormatField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/WheelFormat';
import RandomnessSourceField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/RandomnessSourceField/RandomnessSourceField';

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
  const { control } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });
  const randomSpinEnabled = useWatch<Wheel.Settings>({ name: 'randomSpinEnabled' });

  const submitButton = (
    <Button loading={isLoadingSeed || isCreatingTicket} disabled={isSubmitting} variant='contained' type='submit'>
      {isSubmitting ? t('wheel.spinning') : t('wheel.spin')}
    </Button>
  );

  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.settings.page);

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
              <RandomnessSourceField
                ticketData={ticketData}
                availableQuota={availableQuota}
                ticketError={ticketError}
              />
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
    </>
  );
};

export default WheelSettings;
