import { ColorInput, Slider, Stack, Text } from '@mantine/core';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext';

const RulesSettings = () => {
  const { t } = useTranslation();
  const {
    data: { size, background },
    merge,
  } = useContext(RulesSettingsContext);

  const handleColorChange = (color: string) => {
    merge({ background: { color } });
  };

  const handleSizeChange = (value: number) => {
    merge({ size: value });
  };

  return (
    <Stack gap='sm' w={200}>
      <div>
        <Text size='sm' fw={500} mb={4}>
          {t('rules.background')}
        </Text>
        <ColorInput
          format='hexa'
          value={background.color}
          onChange={handleColorChange}
          withEyeDropper
          popoverProps={{ withinPortal: false }}
        />
      </div>
      <div>
        <Text size='sm' fw={500} mb={4}>
          {t('rules.size')}
        </Text>
        <Slider
          value={size}
          onChange={handleSizeChange}
          min={200}
          max={550}
          step={5}
          label={(v) => `${v}px`}
          marks={[{ value: 350, label: t('common.default') }]}
        />
      </div>
    </Stack>
  );
};

export default RulesSettings;
