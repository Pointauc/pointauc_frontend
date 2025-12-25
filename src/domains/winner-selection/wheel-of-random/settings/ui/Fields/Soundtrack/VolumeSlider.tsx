import { FC } from 'react';
import { Slider, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Volume control slider for audio playback
 */
const VolumeSlider: FC<VolumeSliderProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Group gap='md' style={{ flex: 1 }} align='start' maw={250}>
      <VolumeUpIcon fontSize='small' />
      <Slider
        value={value}
        onChange={(val) => onChange(val)}
        min={0}
        max={1}
        step={0.01}
        style={{ flex: 1 }}
        label={(val) => `${Math.round(val * 100)}%`}
        marks={[
          { value: 0, label: '0%' },
          { value: 1, label: '100%' },
        ]}
      />
    </Group>
  );
};

export default VolumeSlider;
