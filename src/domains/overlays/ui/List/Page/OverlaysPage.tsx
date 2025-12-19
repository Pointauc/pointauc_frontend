import { Group, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  overlaysControllerCreateMutation,
  overlaysControllerListOptions,
  overlaysControllerListQueryKey,
  overlaysControllerRemoveMutation,
} from '@api/openapi/@tanstack/react-query.gen';
import PageContainer from '@components/PageContainer/PageContainer';
import ROUTES from '@constants/routes.constants';
import { RootState } from '@reducers';

import { buildTransform, detectDefaultResolution } from '../../../lib/canvas';
import { hasSeenWelcome, markWelcomeSeen } from '../../../lib/overlaysOnboarding';
import { Overlay, OverlayType } from '../../../model/overlay.types';
import BetaWarning from '../../components/BetaWarning/BetaWarning';
import OverlaysHelpButton from '../../components/OverlaysHelpButton/OverlaysHelpButton';
import InstructionsModal from '../../Modals/InstructionsModal/InstructionsModal';
import UnauthorizedModal from '../../Modals/UnauthorizedModal/UnauthorizedModal';
import WelcomeModal from '../../Modals/WelcomeModal/WelcomeModal';
import CreateOverlayModal from '../CreateOverlayModal/CreateOverlayModal';
import OverlaysGrid from '../OverlaysGrid/OverlaysGrid';

import classes from './OverlaysPage.module.css';

import type { CreateAuctionOverlayDto, CreateWheelOverlayDto } from '@api/openapi/types.gen';

const createDefaultOverlayDto = (type: OverlayType): CreateAuctionOverlayDto | CreateWheelOverlayDto => {
  const canvasResolution = detectDefaultResolution();
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
        backgroundTransparency: 0.5,
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
        backgroundTransparency: 0.5,
      },
    };
  }
};

const OverlaysPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [unauthorizedModalOpened, setUnauthorizedModalOpened] = useState(false);
  const [welcomeModalOpened, setWelcomeModalOpened] = useState(false);
  const [instructionsModalOpened, setInstructionsModalOpened] = useState(false);

  const { data: overlays = [] } = useQuery(overlaysControllerListOptions());
  const user = useSelector((root: RootState) => root.user);

  const isAuthenticated = useMemo(() => {
    return !!user.username;
  }, [user.username]);

  // Show welcome modal on first visit
  useEffect(() => {
    if (!hasSeenWelcome()) {
      setWelcomeModalOpened(true);
    }
  }, []);

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
    if (!isAuthenticated) {
      setUnauthorizedModalOpened(true);
      return;
    }
    setCreateModalOpened(true);
  }, [isAuthenticated]);

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

  const handleWelcomeContinue = useCallback(() => {
    setWelcomeModalOpened(false);
    markWelcomeSeen();
    setInstructionsModalOpened(true);
  }, []);

  const handleWelcomeClose = useCallback(() => {
    setWelcomeModalOpened(false);
    markWelcomeSeen();
    setInstructionsModalOpened(true);
  }, []);

  const handleOpenInstructions = useCallback(() => {
    setInstructionsModalOpened(true);
  }, []);

  return (
    <PageContainer
      title={
        <Group gap='sm' align='center'>
          <Title order={1}>{t('overlays.title')}</Title>
          <OverlaysHelpButton onClick={handleOpenInstructions} />
        </Group>
      }
      classes={{ content: classes.pageContent }}
    >
      <Stack gap='md'>
        <BetaWarning />
        <OverlaysGrid
          overlays={overlays}
          onEditOverlay={handleEditOverlay}
          onCreateOverlay={handleCreateOverlay}
          onDeleteOverlay={handleDeleteOverlay}
        />
      </Stack>
      <CreateOverlayModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSelectType={handleSelectOverlayType}
      />
      <UnauthorizedModal opened={unauthorizedModalOpened} onClose={() => setUnauthorizedModalOpened(false)} />
      <WelcomeModal opened={welcomeModalOpened} onClose={handleWelcomeClose} onContinue={handleWelcomeContinue} />
      <InstructionsModal opened={instructionsModalOpened} onClose={() => setInstructionsModalOpened(false)} />
    </PageContainer>
  );
};

export default OverlaysPage;
