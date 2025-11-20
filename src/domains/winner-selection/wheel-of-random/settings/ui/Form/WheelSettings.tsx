import { Anchor, Button, Checkbox, Flex, Grid, Group, SimpleGrid, Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';
import LoadingButton from '@components/LoadingButton/LoadingButton';
import ClassicDropoutDescription from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/ClassicDropoutDescription';
import SplitField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/Split';
import WheelFormatField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/WheelFormat';
import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { WheelFormat } from '@constants/wheel.ts';

import NewDropoutDescription from '../../../Dropout/ui/NewDropoutDescription/NewDropoutDescription';
import { DropoutHelp } from '../../../Dropout/ui/DropoutHelp';
import { DropoutVariant } from '../../../BaseWheel/BaseWheel';
import WheelStyleSelect from '../Fields/StyleSelect/StyleSelect';
import CoreImageField from '../Fields/CoreImageExpandPanel/CoreImage';
import DropoutFormatField from '../Fields/DropoutFormat';
import RandomSpinConfig from '../Fields/RandomSpinConfig';
import RandomSpinSwitch from '../Fields/RandomSpinSwitch';
import SpinTimeField from '../Fields/SpinTime';

interface WheelSettingsProps {
  nextWinner?: string;
  isLoadingSeed: boolean;
  controls: Wheel.SettingControls;
  children: ReactNode;
  renderSubmitButton?: (defaultButton: ReactNode) => ReactNode;
  direction?: 'row' | 'column';
}

const WheelSettings = (props: WheelSettingsProps) => {
  const { isLoadingSeed, direction = 'column', controls, children, renderSubmitButton } = props;
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
  } = useFormContext<Wheel.Settings>();
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });
  const randomSpinEnabled = useWatch<Wheel.Settings>({ name: 'randomSpinEnabled' });

  const submitButton = (
    <Button loading={isLoadingSeed} disabled={isSubmitting} variant='contained' type='submit'>
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
              <Controller
                name='useRandomOrg'
                render={({ field: { value, onChange }, formState: { isSubmitting } }) => (
                  <Checkbox
                    checked={value}
                    label={t('wheel.useRandomOrg')}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={isSubmitting}
                  />
                )}
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
