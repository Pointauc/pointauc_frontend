import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  overlaysControllerCreateMutation,
  overlaysControllerListOptions,
  overlaysControllerListQueryKey,
  overlaysControllerRemoveMutation,
} from '@api/openapi/@tanstack/react-query.gen';
import PageContainer from '@components/PageContainer/PageContainer';
import ROUTES from '@constants/routes.constants';
import { buildTransform, detectDefaultResolution } from '@pages/overlays/utils/canvas';

import { Overlay, OverlayType } from '../types/overlay.types';

import CreateOverlayModal from './ui/CreateOverlayModal/CreateOverlayModal';
import OverlaysGrid from './ui/OverlaysGrid/OverlaysGrid';

import type { CreateAuctionOverlayDto, CreateWheelOverlayDto } from '@api/openapi/types.gen';

const createDefaultOverlayDto = (type: OverlayType): CreateAuctionOverlayDto | CreateWheelOverlayDto => {
  const canvasResolution = detectDefaultResolution();
  console.log('canvasResolution', canvasResolution);
  const transform = buildTransform({ canvasResolution });

  if (type === 'Auction') {
    return {
      name: `${type} Overlay`,
      type: 'Auction',
      canvasResolution,
      transform,
      settings: {
        showRules: true,
        showTable: true,
        showTimer: true,
        backgroundTransparency: 0,
        autoscroll: false,
        autoscrollSpeed: 50,
      },
    };
  } else {
    return {
      name: `${type} Overlay`,
      type: 'Wheel',
      canvasResolution,
      transform,
      settings: {
        showWheel: true,
        showParticipants: true,
        backgroundTransparency: 0,
      },
    };
  }
};

const OverlaysPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const { data: overlays = [] } = useQuery(overlaysControllerListOptions());

  const createOverlayMutation = useMutation({
    ...overlaysControllerCreateMutation(),
    onSuccess: (createdOverlay) => {
      queryClient.invalidateQueries({ queryKey: overlaysControllerListQueryKey() });
      notifications.show({
        title: t('overlays.createSuccess'),
        message: t('overlays.createSuccessMessage', { name: createdOverlay.name }),
        color: 'green',
      });
      navigate(ROUTES.OVERLAY_EDIT.replace(':id', createdOverlay.id));
    },
    onError: () => {
      notifications.show({
        title: t('common.error'),
        message: t('overlays.createError'),
        color: 'red',
      });
    },
  });

  const deleteOverlayMutation = useMutation({
    ...overlaysControllerRemoveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overlaysControllerListQueryKey() });
      notifications.show({
        message: t('overlays.deleteSuccess'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        message: t('overlays.deleteError'),
        color: 'red',
      });
    },
  });

  const handleEditOverlay = useCallback(
    (overlay: Overlay) => {
      navigate(ROUTES.OVERLAY_EDIT.replace(':id', overlay.id));
    },
    [navigate],
  );

  const handleCreateOverlay = useCallback(() => {
    setCreateModalOpened(true);
  }, []);

  const handleSelectOverlayType = useCallback(
    (type: OverlayType) => {
      const newOverlayDto = createDefaultOverlayDto(type);
      createOverlayMutation.mutate({ body: newOverlayDto });
    },
    [createOverlayMutation],
  );

  const handleDeleteOverlay = useCallback(
    (overlay: Overlay) => {
      deleteOverlayMutation.mutate({ path: { id: overlay.id } });
    },
    [deleteOverlayMutation],
  );

  return (
    <PageContainer title={t('overlays.title')}>
      <OverlaysGrid
        overlays={overlays}
        onEditOverlay={handleEditOverlay}
        onCreateOverlay={handleCreateOverlay}
        onDeleteOverlay={handleDeleteOverlay}
      />
      <CreateOverlayModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSelectType={handleSelectOverlayType}
      />
    </PageContainer>
  );
};

export default OverlaysPage;
