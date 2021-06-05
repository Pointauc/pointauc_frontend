import React, { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import { Checkbox, FormControlLabel, Slider, Typography } from '@material-ui/core';
import { RandomPaceConfig } from '../../../services/SpinPaceService';
import { formatDegree, formatPercents, formatSeconds } from '../../../utils/common.utils';

interface PaceSettingsProps {
  paceConfig: RandomPaceConfig;
  setPaceConfig: Dispatch<SetStateAction<RandomPaceConfig>>;
  spinTime: number;
}

const PaceSettings: FC<PaceSettingsProps> = ({ paceConfig, setPaceConfig, spinTime }) => {
  const { allowBackStep, valueDisabledZone, valueRandomZone, randomOffset } = paceConfig;

  const maxOffset = useMemo(() => Math.round(Math.min(5, spinTime * 0.3)), [spinTime]);
  const handleBackStepChange = useCallback(
    (e, checked: boolean) => {
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
    (e, value: number | number[]) => {
      setPaceConfig((config) => ({ ...config, valueRandomZone: Number(value) }));
    },
    [setPaceConfig],
  );
  const handleRandomOffsetChange = useCallback(
    (e, value: number | number[]) => {
      setPaceConfig((config) => ({ ...config, randomOffset: Number(value) }));
    },
    [setPaceConfig],
  );
  const handleDisabledZoneChange = useCallback(
    (e, value: number | number[]) => {
      setPaceConfig((config) => ({ ...config, valueDisabledZone: Number(value) }));
    },
    [setPaceConfig],
  );

  return (
    <>
      <FormControlLabel
        control={<Checkbox checked={allowBackStep} onChange={handleBackStepChange} color="primary" />}
        label="Вращать в обратную сторону"
        className="wheel-controls-checkbox"
      />
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
      <div className="wheel-controls-row">
        <Typography className="wheel-controls-tip lg">Зона начала рандома</Typography>
        <Slider
          value={randomOffset}
          step={0.5}
          min={0.5}
          max={maxOffset}
          valueLabelDisplay="auto"
          valueLabelFormat={formatSeconds}
          onChange={handleRandomOffsetChange}
          marks={[
            { value: 0.5, label: '0.5c.' },
            { value: maxOffset, label: `${Math.round(maxOffset)}c.` },
          ]}
        />
      </div>
      <Typography className="wheel-controls-tip hint">Время с конца, когда начнется докрут</Typography>
      <div className="wheel-controls-row">
        <Typography className="wheel-controls-tip lg">Макс. дистанция</Typography>
        <Slider
          value={valueRandomZone}
          step={30}
          min={90}
          max={900}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDegree}
          onChange={handleValueRandomZoneChange}
          marks={[
            { value: 90, label: '180°' },
            { value: 900, label: '900°' },
          ]}
        />
      </div>
      <Typography className="wheel-controls-tip lg">Заблокированная зона рандома</Typography>
      <Slider
        value={valueDisabledZone}
        step={0.01}
        min={0}
        max={0.7}
        valueLabelDisplay="auto"
        valueLabelFormat={formatPercents}
        onChange={handleDisabledZoneChange}
        marks={[
          { value: 0, label: '0%' },
          { value: 0.7, label: '70%' },
        ]}
      />
      <Typography className="wheel-controls-tip hint">
        Чем больше значение, тем ближе к макс дистанции будет рандомится докрут.
      </Typography>
    </>
  );
};

export default PaceSettings;
