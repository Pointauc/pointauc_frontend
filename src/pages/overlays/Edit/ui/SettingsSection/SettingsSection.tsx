import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { Title, TextInput, Button, Group, Stack, Divider, Badge, Text, Tooltip, ActionIcon } from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconEdit, IconArrowBackUp } from '@tabler/icons-react';

import { Overlay } from '../../../types/overlay.types';
import UrlControls from '../UrlControls';

import AuctionSettings from './AuctionSettings';
import WheelSettings from './WheelSettings';

interface SettingsSectionProps {
  overlay: Overlay;
  onUpdate: (overlay: Overlay) => void;
  onDelete: () => void;
}

type OverlayFormData = {
  name: string;
  settings: Overlay['settings'];
};

const SettingsSection: FC<SettingsSectionProps> = ({ overlay, onUpdate, onDelete }) => {
  const { t } = useTranslation();

  const form = useForm<OverlayFormData>({
    defaultValues: {
      name: overlay.name,
      settings: overlay.settings,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = form;

  const onSubmit = useCallback(
    (data: OverlayFormData) => {
      const updatedOverlay = {
        ...overlay,
        name: data.name.trim(),
        settings: data.settings,
      } as Overlay;
      onUpdate(updatedOverlay);
      reset(updatedOverlay);
    },
    [overlay, onUpdate, reset],
  );

  const onReset = useCallback(() => {
    reset(overlay);
  }, [reset, overlay]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Auction':
        return 'blue';
      case 'Wheel':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Stack gap='lg' h='100%' justify='space-between'>
          <Stack gap='sm'>
            <Group justify='space-between' align='center'>
              <Title order={3}>{t('overlays.settings.title')}</Title>
              <Group gap='xs'>
                <Badge color={getBadgeColor(overlay.type)} variant='filled' size='md'>
                  {t(`overlays.overlayTypes.${overlay.type}`)}
                </Badge>
                <ActionIcon color='red' size='lg' onClick={onDelete}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Overlay Name */}
            <Stack gap='sm'>
              <TextInput label={t('overlays.settings.overlayName')} {...register('name', { required: true })} />
            </Stack>

            {/* Overlay Links */}

            <Stack gap='sm'>
              <Title order={5} c='dark.2'>
                {t('overlays.overlayLink')}
              </Title>
              <UrlControls overlayId={overlay.id} />
            </Stack>

            <Divider />

            {/* Type-specific Settings */}
            <Stack gap='sm'>
              <Title order={5} c='dark.2'>
                {t('overlays.displaySettings')}
              </Title>
              {overlay.type === 'Auction' ? <AuctionSettings /> : <WheelSettings />}
            </Stack>
          </Stack>

          <Group grow>
            <Button
              variant='default'
              color='gray'
              onClick={onReset}
              disabled={!isDirty}
              leftSection={<IconArrowBackUp size={16} />}
            >
              {t('common.revert')}
            </Button>
            <Tooltip disabled={isDirty} openDelay={750} label={t('common.noChanges')}>
              <Button color='green' type='submit' disabled={!isDirty} leftSection={<IconDeviceFloppy size={16} />}>
                {t('common.save')}
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default SettingsSection;
