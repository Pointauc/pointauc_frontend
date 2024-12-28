import React, { ReactNode } from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

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

  return (
    <Grid container spacing={2} direction={direction} flexGrow={1} className='settings'>
      <Grid container style={{ gap: 8 }} item direction='column' xs={direction === 'row' ? 6 : undefined}>
        <div className='wheel-controls-row'>
          {renderSubmitButton ? renderSubmitButton(submitButton) : submitButton}
          {!randomSpinEnabled && <SpinTimeField />}
          {randomSpinEnabled && <RandomSpinConfig />}
          <RandomSpinSwitch />
        </div>
        {controls.mode && <WheelFormatField />}
        {format === WheelFormat.Dropout && (
          <>
            <DropoutFormatField />
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
        item
        direction='column'
        xs={direction === 'row' ? 6 : undefined}
      >
        <CoreImageField />
      </Grid>
    </Grid>
  );
};

export default WheelSettings;
