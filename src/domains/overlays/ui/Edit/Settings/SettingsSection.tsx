import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import {
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Divider,
  Badge,
  Text,
  Tooltip,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconEdit, IconArrowBackUp } from '@tabler/icons-react';

import { Overlay } from '../../../model/overlay.types';
import UrlControls from '../../UrlControls';
import AuctionSettings from '../../../Auction/ui/Settings/AuctionSettings';
import WheelSettings from '../../../Wheel/ui/Settings/WheelSettings';

interface SettingsSectionProps {
  onDelete: () => void;
  id: string;
  type: string;
}

const SettingsSection: FC<SettingsSectionProps> = ({ onDelete, id, type }) => {
  const { t } = useTranslation();

  const {
    register,
    formState: { isDirty },
    reset,
  } = useFormContext();

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
    <Stack gap='lg' justify='space-between'>
      <Group justify='space-between' align='center'>
        <Title order={3}>{t('overlays.settings.title')}</Title>
        <Group gap='xs'>
          <Badge color={getBadgeColor(type)} variant='filled' size='md'>
            {t(`overlays.overlayTypes.${type}`)}
          </Badge>
          <ActionIcon color='red' size='lg' onClick={onDelete}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <ScrollArea type='auto' scrollbars='y' offsetScrollbars>
        <Stack gap='sm'>
          {/* Overlay Name */}
          <Stack gap='sm'>
            <TextInput label={t('overlays.settings.overlayName')} {...register('name', { required: true })} />
          </Stack>

          {/* Overlay Links */}

          <Stack gap='sm'>
            <Title order={5} c='dark.2'>
              {t('overlays.overlayLink')}
            </Title>
            <UrlControls overlayId={id} />
          </Stack>

          <Divider />

          {/* Type-specific Settings */}
          <Stack gap='sm'>
            <Title order={5} c='dark.2'>
              {t('overlays.displaySettings')}
            </Title>
            {type === 'Auction' ? <AuctionSettings /> : <WheelSettings />}
          </Stack>
        </Stack>
      </ScrollArea>

      <Group grow>
        <Button
          variant='default'
          color='gray'
          onClick={reset}
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
  );
};

export default SettingsSection;
