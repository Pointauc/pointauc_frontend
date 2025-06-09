import { FormGroup, IconButton, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { AspectRatio, Box, Button, Flex, Grid, Group, Image, Overlay, Slider, Text } from '@mantine/core';

import { BACKGROUND_PRESETS } from '@constants/common.constants';
import ImagePresetsInput from '@components/Form/ImagePresetsInput/ImagePresetsInput';
import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import { calcBackgroundOpacity, calcUiElementsOpacity } from '@utils/ui/background';

import styles from './index.module.css';

const previewWidth = 220;
const blurRatio = 1920 / previewWidth;

const BackgroundSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { field } = useController({ control, name: 'background' });

  const opacity = useController({ control, name: 'backgroundOverlayOpacity' });
  const [localOpacity, setLocalOpacity] = useState(opacity.field.value ?? 0);

  const blur = useController({ control, name: 'backgroundBlur' });
  const [localBlur, setLocalBlur] = useState(blur.field.value ?? 0);

  const saveOpacity = (value: number): void => {
    opacity.field.onChange(value / 100);
    opacity.field.onBlur();
  };

  const saveBlur = (value: number): void => {
    blur.field.onChange(value);
    blur.field.onBlur();
  };

  useEffect(() => {
    setLocalOpacity(Math.round(opacity.field.value * 100) ?? 0);
    setLocalBlur(blur.field.value ?? 0);
  }, [opacity.field.value, blur.field.value]);

  const setValue = (value: string | null): void => {
    field.onChange(value);
    field.onBlur();
  };

  const handleImageChange = (image: string): void => {
    setValue(image);
  };

  const resetBackground = (): void => {
    setValue(null);
  };

  const imageOpacity = useMemo(() => calcBackgroundOpacity(localOpacity / 100), [localOpacity]);
  const uiElementsOpacity = useMemo(() => calcUiElementsOpacity(localOpacity / 100), [localOpacity]);

  return (
    <FormGroup row className='auc-settings-row'>
      <Typography variant='body1' className='MuiFormControlLabel-label'>
        {t('settings.auc.background')}
      </Typography>
      <ImageLinkInput
        buttonTitle={t('settings.auc.uploadBackground')}
        buttonClass='upload-background'
        onChange={handleImageChange}
      />
      {/* <ImagePresetsInput
        images={BACKGROUND_PRESETS}
        buttonTitle={t('settings.auc.selectFromList')}
        onChange={handleImageChange}
      /> */}
      {field.value && (
        <Flex w='100%' mt='md' mb='lg'>
          <Box w={280}>
            <AspectRatio ratio={16 / 9} maw={previewWidth} pos='relative'>
              <Image src={field.value} alt={t('settings.auc.backgroundAlt')} radius='md' />
              <Overlay color='#242424' backgroundOpacity={imageOpacity} blur={localBlur / 4} />
              <Grid
                classNames={{ root: styles.overlayContainer, inner: styles.overlayContainerInner }}
                h='100%'
                w='100%'
              >
                <Grid.Col span='auto'>
                  <Box className={styles.overlaySide} opacity={uiElementsOpacity} />
                </Grid.Col>
                <Grid.Col span={5}>
                  <Box className={styles.overlayMain} opacity={uiElementsOpacity} />
                </Grid.Col>
                <Grid.Col span='auto'>
                  <Box className={styles.overlaySide} opacity={uiElementsOpacity} />
                </Grid.Col>
              </Grid>
            </AspectRatio>
          </Box>
          <Flex direction='column' gap='lg' justify='start' style={{ flexGrow: 1 }}>
            <Grid>
              <Grid.Col span={4}>
                <Text>{t('settings.auc.backgroundOverlayOpacity')}</Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Slider
                  value={localOpacity}
                  onChange={setLocalOpacity}
                  onChangeEnd={() => saveOpacity(localOpacity)}
                  label={(value) => `${value}%`}
                  min={0}
                  max={100}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={4}>
                <Text>{t('settings.auc.backgroundBlur')}</Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Slider
                  value={localBlur}
                  onChange={setLocalBlur}
                  onChangeEnd={() => saveBlur(localBlur)}
                  label={(value) => `${Math.round((value * 100) / 30)}%`}
                  min={0}
                  max={30}
                />
              </Grid.Col>
            </Grid>
            <Button variant='outline' color='red.3' onClick={resetBackground}>
              {t('settings.auc.resetBackground')}
            </Button>
          </Flex>
        </Flex>
      )}
    </FormGroup>
  );
};

export default BackgroundSettings;
