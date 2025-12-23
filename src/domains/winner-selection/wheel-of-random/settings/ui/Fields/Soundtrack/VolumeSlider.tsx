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
    <Group gap="md" style={{ flex: 1 }}>
      <Text size="sm" fw={500} style={{ minWidth: 60 }}>
        {t('wheel.soundtrack.volume.label')}
      </Text>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <VolumeUpIcon fontSize="small" />
        <Slider
          value={value * 100}
          onChange={(val) => onChange(val / 100)}
          min={0}
          max={100}
          step={1}
          style={{ flex: 1 }}
          label={(val) => `${val}%`}
        />
        <Text size="sm" c="dimmed" style={{ minWidth: 40 }}>
          {Math.round(value * 100)}%
        </Text>
      </div>
    </Group>
  );
};

export default VolumeSlider;

