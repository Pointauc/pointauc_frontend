import React, { ReactNode } from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Anchor } from '@mantine/core';

import { WheelFormat } from '@constants/wheel.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import WheelFormatField from '@components/RandomWheel/WheelSettings/fields/WheelFormat.tsx';
import DropoutFormatField from '@components/RandomWheel/WheelSettings/fields/DropoutFormat.tsx';
import SpinTimeField from '@components/RandomWheel/WheelSettings/fields/SpinTime.tsx';
import { DropoutVariant } from '@components/BaseWheel/BaseWheel.tsx';
import ClassicDropoutDescription from '@components/RandomWheel/WheelSettings/fields/ClassicDropoutDescription.tsx';
import NewDropoutDescription from '@components/RandomWheel/NewDropoutDescription/NewDropoutDescription.tsx';
import ParticipantsImportField from '@components/RandomWheel/WheelSettings/fields/ParticipantsImport.tsx';
import SplitField from '@components/RandomWheel/WheelSettings/fields/Split.tsx';
import CoreImageField from '@components/RandomWheel/WheelSettings/fields/CoreImage.tsx';
import RandomSpinSwitch from '@components/RandomWheel/WheelSettings/fields/RandomSpinSwitch.tsx';
import RandomSpinConfig from '@components/RandomWheel/WheelSettings/fields/RandomSpinConfig.tsx';
import { DropoutHelp } from '@components/RandomWheel/DropoutHelp';
import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';
import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';

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
    <LoadingButton
      isLoading={isLoadingSeed}
      disabled={isSubmitting}
      className='wheel-controls-button'
      variant='contained'
      color='primary'
      type='submit'
    >
      {isSubmitting ? t('wheel.spinning') : t('wheel.spin')}
    </LoadingButton>
  );

  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.settings.page);

  return (
    <Grid container spacing={2} direction={direction} flexGrow={1} className='settings'>
      <FirstTimeHelpNotification
        featureKey='wheelSettingsHelpSeen'
        message={
          <Trans
            i18nKey='wheel.helpNotification'
            components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' />, 2: <b /> }}
          />
        }
      />
      <Grid container style={{ gap: 8 }} direction='column' size={direction === 'row' ? 6 : undefined}>
        <Grid container className='wheel-controls-row' spacing={1}>
          {renderSubmitButton ? renderSubmitButton(submitButton) : submitButton}
          <Grid flexGrow={1}>
            {!randomSpinEnabled && <SpinTimeField />}
            {randomSpinEnabled && <RandomSpinConfig />}
          </Grid>
          <Grid>
            <RandomSpinSwitch />
          </Grid>
        </Grid>
        {controls.mode && <WheelFormatField />}
        {format === WheelFormat.Dropout && (
          <>
            <DropoutFormatField />
            <DropoutHelp />
            {dropoutVariant === DropoutVariant.New && <NewDropoutDescription />}
            {dropoutVariant === DropoutVariant.Classic && <ClassicDropoutDescription />}
          </>
        )}
        <div>{children}</div>
        {controls.split && <SplitField />}
        {controls.randomOrg && (
          <FormControlLabel
            control={
              <Controller
                name='useRandomOrg'
                render={({ field: { value, onChange } }) => (
                  <Checkbox checked={value} onChange={(_, checked) => onChange(checked)} color='primary' />
                )}
              />
            }
            label={t('wheel.useRandomOrg')}
            className='wheel-controls-checkbox'
          />
        )}
        {controls.import && <ParticipantsImportField />}
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
      </Grid>
      <Grid
        flexGrow={1}
        flexBasis={0}
        minHeight={0}
        flexShrink={1}
        flexWrap='nowrap'
        container
        direction='column'
        size={direction === 'row' ? 6 : undefined}
      >
        <CoreImageField />
      </Grid>
    </Grid>
  );
};

export default WheelSettings;
