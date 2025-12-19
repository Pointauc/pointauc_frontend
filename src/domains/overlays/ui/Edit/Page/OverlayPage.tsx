import { Button, Container, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  overlaysControllerGetOptions,
  overlaysControllerGetQueryKey,
  overlaysControllerListQueryKey,
  overlaysControllerRemoveMutation,
  overlaysControllerUpdateMutation,
} from '@api/openapi/@tanstack/react-query.gen';
import PageContainer from '@components/PageContainer/PageContainer';

import { Overlay } from '../../../model/overlay.types';
import OverlaysHelpButton from '../../components/OverlaysHelpButton/OverlaysHelpButton';
import InstructionsModal from '../../Modals/InstructionsModal/InstructionsModal';
import { OverlayForm } from '../Form';

import type { UpdateAuctionOverlayDto, UpdateWheelOverlayDto } from '@api/openapi/types.gen';

const convertLocalOverlayToUpdateDto = (overlay: Overlay): UpdateAuctionOverlayDto | UpdateWheelOverlayDto => {
  if (overlay.type === 'Auction') {
    return {
      name: overlay.name,
      canvasResolution: overlay.canvasResolution,
      settings: overlay.settings,
      transform: overlay.transform,
    } as UpdateAuctionOverlayDto;
  } else {
    return {
      name: overlay.name,
      canvasResolution: overlay.canvasResolution,
      settings: overlay.settings,
      transform: overlay.transform,
    } as UpdateWheelOverlayDto;
  }
};

const OverlayPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [instructionsModalOpened, setInstructionsModalOpened] = useState(false);

  const { data: overlay, isLoading } = useQuery({
    ...overlaysControllerGetOptions({ path: { id: id! } }),
    enabled: !!id,
  });

  const { mutate: updateOverlay } = useMutation({
    ...overlaysControllerUpdateMutation(),
    onSuccess: (data) => {
      notifications.show({
        message: t('overlays.updateSuccess'),
        color: 'green',
      });
      queryClient.setQueryData(overlaysControllerGetQueryKey({ path: { id: id! } }), data);
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

  const handleOpenInstructions = useCallback(() => {
    setInstructionsModalOpened(true);
  }, []);

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
    <PageContainer
      title={
        <>
          <Group mb='xl'>
            <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={handleGoBack}>
              {t('overlays.title')}
            </Button>
            <Title order={2}>{overlay.name}</Title>
            <OverlaysHelpButton onClick={handleOpenInstructions} />
          </Group>
        </>
      }
      fixedHeight
    >
      <OverlayForm overlay={overlay} onUpdate={handleOverlayUpdate} onDelete={handleOverlayDelete} />
      <InstructionsModal opened={instructionsModalOpened} onClose={() => setInstructionsModalOpened(false)} />
    </PageContainer>
  );
};

export default OverlayPage;
