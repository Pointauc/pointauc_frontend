import { FC, useCallback, useMemo } from 'react';
import { Grid, Paper } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';

import { Overlay } from '../../../types/overlay.types';
import PreviewSection from '../PreviewSection/PreviewSection';
import SettingsSection from '../SettingsSection/SettingsSection';

type OverlayFormData = {
  name: string;
  canvasResolution: Overlay['canvasResolution'];
  settings: Overlay['settings'];
};

type OverlayFormProps = {
  overlay: Overlay;
  onUpdate: (overlay: Overlay) => void;
  onDelete: () => void;
};

export const OverlayForm: FC<OverlayFormProps> = ({ overlay, onUpdate, onDelete }) => {
  const form = useForm<OverlayFormData>({
    defaultValues: {
      name: overlay.name,
      canvasResolution: overlay.canvasResolution,
      settings: overlay.settings,
    },
    mode: 'onChange',
  });

  const { reset, handleSubmit, watch } = form;

  const onSubmit = useCallback(
    (data: OverlayFormData) => {
      const updatedOverlay = {
        ...overlay,
        name: data.name.trim(),
        canvasResolution: data.canvasResolution,
        settings: data.settings,
      } as Overlay;
      onUpdate(updatedOverlay);
      reset(updatedOverlay);
    },
    [overlay, onUpdate, reset],
  );

  const settings = watch('settings');
  const canvasResolution = watch('canvasResolution');

  const previewOverlay = useMemo(
    () =>
      ({
        ...overlay,
        canvasResolution,
        settings,
      }) as any,
    [overlay, canvasResolution, settings],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Grid align='start'>
          <Grid.Col span={3}>
            <Paper withBorder p='md' bg='dark.6' shadow='md'>
              <SettingsSection onDelete={onDelete} id={overlay.id} type={overlay.type} />
            </Paper>
          </Grid.Col>

          <Grid.Col span={9}>
            <Paper withBorder p='md' bg='dark.6' shadow='md'>
              <PreviewSection overlay={previewOverlay} />
            </Paper>
          </Grid.Col>
        </Grid>
      </form>
    </FormProvider>
  );
};
