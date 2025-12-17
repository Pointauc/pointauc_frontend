import { FC, useCallback, useMemo } from 'react';
import { Box, Grid, Group, Paper } from '@mantine/core';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { Overlay } from '../../../model/overlay.types';
import PreviewSection from '../Preview/PreviewSection';
import SettingsSection from '../Settings/SettingsSection';

type OverlayFormData = {
  name: string;
  canvasResolution: Overlay['canvasResolution'];
  settings: Overlay['settings'];
  transform: Overlay['transform'];
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
      transform: overlay.transform,
    },
    mode: 'onChange',
  });

  const { reset, handleSubmit, setValue, control } = form;

  const onSubmit = useCallback(
    (data: OverlayFormData) => {
      const updatedOverlay = {
        ...overlay,
        name: data.name.trim(),
        canvasResolution: data.canvasResolution,
        settings: data.settings,
        transform: data.transform,
      } as Overlay;
      onUpdate(updatedOverlay);
      reset(updatedOverlay);
    },
    [overlay, onUpdate, reset],
  );

  const settings = useWatch({ control, name: 'settings' });
  const canvasResolution = useWatch({ control, name: 'canvasResolution' });
  const transform = useWatch({ control, name: 'transform' });

  const previewOverlay = useMemo(
    () =>
      ({
        ...overlay,
        canvasResolution,
        settings,
        transform,
      }) as any,
    [overlay, canvasResolution, settings, transform],
  );

  const handleTransformUpdate = useCallback(
    (newTransform: Overlay['transform']) => {
      setValue('transform', newTransform, { shouldDirty: true });
    },
    [setValue],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%', width: '100%' }}>
        <Group align='start' h='100%' wrap='nowrap'>
          <Box h='100%' display='flex' style={{ alignItems: 'flex-start' }}>
            <Paper withBorder p='md' bg='dark.6' shadow='md' mah='100%' display='flex'>
              <SettingsSection onDelete={onDelete} id={overlay.id} type={overlay.type} />
            </Paper>
          </Box>

          <PreviewSection overlay={previewOverlay} onTransformUpdate={handleTransformUpdate} />
        </Group>
      </form>
    </FormProvider>
  );
};
