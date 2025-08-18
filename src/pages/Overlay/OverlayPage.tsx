import { FC, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Grid, Paper, Title, Button, Group, AspectRatio } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import {
  overlaysControllerGetOptions,
  overlaysControllerUpdateMutation,
  overlaysControllerRemoveMutation,
  overlaysControllerListOptions,
  overlaysControllerGetQueryKey,
  overlaysControllerListQueryKey,
} from '@api/openapi/@tanstack/react-query.gen';

import { Overlay } from '../overlays/types/overlay.types';

import SettingsSection from './components/SettingsSection/SettingsSection';
import PreviewSection from './components/PreviewSection/PreviewSection';

import type {
  AuctionOverlayDto,
  WheelOverlayDto,
  UpdateAuctionOverlayDto,
  UpdateWheelOverlayDto,
} from '@api/openapi/types.gen';

const convertLocalOverlayToUpdateDto = (overlay: Overlay): UpdateAuctionOverlayDto | UpdateWheelOverlayDto => {
  if (overlay.type === 'Auction') {
    return {
      name: overlay.name,
      settings: overlay.settings,
    } as UpdateAuctionOverlayDto;
  } else {
    return {
      name: overlay.name,
      settings: overlay.settings,
    } as UpdateWheelOverlayDto;
  }
};

const OverlayPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: overlay, isLoading } = useQuery({
    ...overlaysControllerGetOptions({ path: { id: id! } }),
    enabled: !!id,
  });

  const { mutate: updateOverlay } = useMutation({
    ...overlaysControllerUpdateMutation(),
    onSuccess: () => {
      notifications.show({
        message: t('overlays.updateSuccess'),
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: overlaysControllerGetQueryKey({ path: { id: id! } }) });
      queryClient.invalidateQueries({ queryKey: overlaysControllerListQueryKey() });
    },
    onError: () => {
      notifications.show({
        message: t('overlays.updateError'),
        color: 'red',
      });
    },
  });

  const { mutate: deleteOverlay } = useMutation({
    ...overlaysControllerRemoveMutation(),
    onSuccess: () => {
      notifications.show({
        message: t('overlays.deleteSuccess'),
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['overlaysControllerList'] });
      navigate('/overlays');
    },
    onError: () => {
      notifications.show({
        message: t('overlays.deleteError'),
        color: 'red',
      });
    },
  });

  const handleGoBack = useCallback(() => {
    navigate('/overlays');
  }, [navigate]);

  const handleOverlayUpdate = useCallback(
    (updatedOverlay: Overlay) => {
      const updateDto = convertLocalOverlayToUpdateDto(updatedOverlay);
      updateOverlay({ path: { id: id! }, body: updateDto });
    },
    [updateOverlay, id],
  );

  const handleOverlayDelete = useCallback(() => {
    deleteOverlay({ path: { id: id! } });
  }, [deleteOverlay, id]);

  if (isLoading) {
    return (
      <Container size='xl' py='xl'>
        <Title order={2}>{t('overlays.loading')}</Title>
      </Container>
    );
  }

  if (!overlay) {
    return (
      <Container size='xl' py='xl'>
        <Group mb='md'>
          <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={handleGoBack}>
            {t('overlays.backToOverlays')}
          </Button>
        </Group>
        <Title order={2} c='dimmed'>
          {t('overlays.overlayNotFound')}
        </Title>
      </Container>
    );
  }

  return (
    <Container fluid p='xl'>
      <Group mb='xl'>
        <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={handleGoBack}>
          {t('overlays.title')}
        </Button>
        <Title order={2}>{overlay.name}</Title>
      </Group>

      <Grid>
        <Grid.Col span={3}>
          <Paper withBorder p='md' h='100%'>
            <SettingsSection overlay={overlay} onUpdate={handleOverlayUpdate} onDelete={handleOverlayDelete} />
          </Paper>
        </Grid.Col>

        <Grid.Col span={9}>
          <Paper withBorder p='md' h='100%'>
            <AspectRatio ratio={16 / 9}>
              <PreviewSection overlay={overlay} />
            </AspectRatio>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default OverlayPage;
