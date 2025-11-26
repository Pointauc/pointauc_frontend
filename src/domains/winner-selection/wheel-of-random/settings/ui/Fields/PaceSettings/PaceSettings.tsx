import { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import { Checkbox, Slider, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { RandomPaceConfig } from '@services/SpinPaceService.ts';
import { formatDegree, formatPercents, formatSeconds } from '@utils/common.utils.ts';

interface PaceSettingsProps {
  paceConfig: RandomPaceConfig;
  setPaceConfig: Dispatch<SetStateAction<RandomPaceConfig>>;
  spinTime: number;
}

const PaceSettings: FC<PaceSettingsProps> = ({ paceConfig, setPaceConfig, spinTime }) => {
  const { t } = useTranslation();
  const { allowBackStep, valueDisabledZone, valueRandomZone, randomOffset } = paceConfig;

  const maxOffset = useMemo(() => Math.round(Math.min(5, spinTime * 0.3)), [spinTime]);
  const handleBackStepChange = useCallback(
    (e: any, checked: boolean) => {
      setPaceConfig((config) => ({ ...config, allowBackStep: checked }));
    },
    [setPaceConfig],
  );
  // const handlePointsChange = useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     setPaceConfig((config) => ({ ...config, points: Number(e.target.value) }));
  //   },
  //   [setPaceConfig],
  // );
  const handleValueRandomZoneChange = useCallback(
    (value: number) => {
      setPaceConfig((config) => ({ ...config, valueRandomZone: Number(value) }));
    },
    [setPaceConfig],
  );
  const handleRandomOffsetChange = useCallback(
    (value: number) => {
      setPaceConfig((config) => ({ ...config, randomOffset: Number(value) }));
    },
    [setPaceConfig],
  );
  const handleDisabledZoneChange = useCallback(
    (value: number) => {
      setPaceConfig((config) => ({ ...config, valueDisabledZone: Number(value) }));
    },
    [setPaceConfig],
  );

  return (
    <>
      <Checkbox checked={allowBackStep} className='wheel-controls-checkbox' />
      <Text>{t('wheel.pace.spinInReverse')}</Text>
      {/* <div className="wheel-controls-row"> */}
      {/*  <Typography className="wheel-controls-tip">Количество точек</Typography> */}
      {/*  <TextField */}
      {/*    className="wheel-controls-input" */}
      {/*    variant="outlined" */}
      {/*    margin="dense" */}
      {/*    onChange={handlePointsChange} */}
      {/*    value={points} */}
      {/*  /> */}
      {/* </div> */}
      <div className='wheel-controls-row'>
        <Text className='wheel-controls-tip lg'>{t('wheel.pace.randomZoneStart')}</Text>
        <Slider
          value={randomOffset}
          step={0.5}
          min={0.5}
          max={maxOffset}
          onChange={(value) => handleRandomOffsetChange(value)}
          marks={[
            { value: 0.5, label: '0.5c.' },
            { value: maxOffset, label: `${Math.round(maxOffset)}c.` },
          ]}
        />
      </div>
      <Text className='wheel-controls-tip hint'>{t('wheel.pace.respinMark')}</Text>
      <div className='wheel-controls-row'>
        <Text className='wheel-controls-tip lg'>{t('wheel.pace.maxDistance')}</Text>
        <Slider
          value={valueRandomZone}
          step={30}
          min={90}
          max={900}
          onChange={(value) => handleValueRandomZoneChange(value)}
          marks={[
            { value: 90, label: '180°' },
            { value: 900, label: '900°' },
          ]}
        />
      </div>
      <Text className='wheel-controls-tip lg'>{t('wheel.pace.blockedZone')}</Text>
      <Slider
        value={valueDisabledZone}
        step={0.01}
        min={0}
        max={0.7}
        onChange={(value: number) => handleDisabledZoneChange(value)}
        marks={[
          { value: 0, label: '0%' },
          { value: 0.7, label: '70%' },
        ]}
      />
      <Text className='wheel-controls-tip hint'>{t('wheel.pace.blockedZoneDescription')}</Text>
    </>
  );
};

export default PaceSettings;
