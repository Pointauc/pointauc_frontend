import { ActionIcon, Alert, Anchor, Badge, Checkbox, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconExclamationMark, IconQuestionMark } from '@tabler/icons-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';

import { WheelFormat } from '@constants/wheel.ts';
import ROUTES from '@constants/routes.constants';
import { RootState } from '@reducers';
import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/DropoutVariant';
import { checkHasUserToken } from '@domains/bids/lib/useInitializeUser';
import TicketCard from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/TicketCard/TicketCard';
import RandomnessExplanationModal from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/RandomnessExplanationModal';
import { RevealedData } from '@domains/winner-selection/wheel-of-random/lib/hooks/useTicketManagement';

import classes from './ViewerVerifiableSpinField.module.css';

interface ViewerVerifiableSpinFieldProps {
  ticketData: RevealedData | null;
  ticketError: Error | null;
  /** Rate limit countdown for the next ticket generation; the card shows it instead of ticket data */
  ticketRateLimitRemainingMs?: number | null;
  isDropoutFlowStarted: boolean;
}

/**
 * Viewer verifiable spin checkbox with integrated side effects:
 * - Auto-unchecks for restricted wheel types (battle royale, classic dropout)
 *   and when the user is known to be logged out (no session cookie)
 * - Disabled while a spin is in progress or in the middle of a dropout flow
 * - Disabled with an explanatory tooltip and an exclamation mark icon
 *   when the user is known to be logged out
 * - Displays the verification ticket card and ticket errors
 */
const ViewerVerifiableSpinField = ({
  ticketData,
  ticketError,
  ticketRateLimitRemainingMs,
  isDropoutFlowStarted,
}: ViewerVerifiableSpinFieldProps) => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const format = useWatch<Wheel.Settings, 'format'>({ name: 'format', control });
  const dropoutVariant = useWatch<Wheel.Settings, 'dropoutVariant'>({ name: 'dropoutVariant', control });
  const viewerVerifiableSpin = useWatch<Wheel.Settings, 'viewerVerifiableSpin'>({ name: 'viewerVerifiableSpin', control });
  const { username } = useSelector((root: RootState) => root.user);
  const isAuthenticated = useMemo(() => Boolean(username), [username]);
  const [randomnessModalOpened, setRandomnessModalOpened] = useState(false);

  const isRestrictedWheel =
    format === WheelFormat.BattleRoyal || (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

  // Auto-uncheck for restricted wheel types, and for users who cannot use the
  // feature at all: revealing tickets requires an authenticated session, so a
  // default-on checkbox must not stay checked while logged out.
  // The username arrives asynchronously after a page refresh, so the session
  // cookie is the signal for "known logged out" — otherwise the saved value
  // must not be clobbered (and autosaved) while auth is still resolving.
  const hasUserSession = checkHasUserToken();
  const isKnownLoggedOut = !hasUserSession && !isAuthenticated;

  useEffect(() => {
    if ((isRestrictedWheel || isKnownLoggedOut) && viewerVerifiableSpin) {
      setValue('viewerVerifiableSpin', false);
    }
  }, [isRestrictedWheel, isKnownLoggedOut, viewerVerifiableSpin, setValue]);

  const isDisabled = isKnownLoggedOut || isRestrictedWheel || isSubmitting || isDropoutFlowStarted;

  const tooltipLabel = useMemo<ReactNode>(() => {
    const content = [<Text size='sm'>{t('wheel.viewerVerifiableSpin.description')}</Text>];

    if (isKnownLoggedOut) {
      content.push(
        <Text key='unauthenticated' size='sm'>
          {t('wheel.viewerVerifiableSpin.unauthenticatedTooltip')}
        </Text>,
        <Anchor
          key='settingsLink'
          component={Link}
          to={`${ROUTES.SETTINGS}#website-settings-channel-points`}
          size='sm'
          underline='not-hover'
        >
          {t('wheel.viewerVerifiableSpin.openSettingsLink')}
        </Anchor>,
      );
    } else if (isRestrictedWheel) {
      content.push(
        <Text key='restricted' size='sm'>
          {t('wheel.viewerVerifiableSpin.restrictedTooltip')}
        </Text>,
      );
    } else if (isSubmitting) {
      content.push(
        <Text key='spinInProgress' size='sm'>
          {t('wheel.viewerVerifiableSpin.spinInProgressTooltip')}
        </Text>,
      );
    } else if (isDropoutFlowStarted) {
      content.push(
        <Text key='dropoutFlow' size='sm'>
          {t('wheel.viewerVerifiableSpin.dropoutFlowTooltip')}
        </Text>,
      );
    }

    return <Stack gap='xs'>{content}</Stack>;
  }, [isKnownLoggedOut, isRestrictedWheel, isSubmitting, isDropoutFlowStarted, t]);

  const ticketErrorMessage = useMemo(() => {
    if (!viewerVerifiableSpin || !ticketError) return null;
    if ((ticketError as AxiosError)?.status === 403) {
      return t('wheel.ticket.unauthorizedError');
    }
    return t('wheel.ticket.unknownError');
  }, [ticketError, viewerVerifiableSpin, t]);

  const handleCheckboxChange = (checked: boolean) => {
    setValue('viewerVerifiableSpin', checked);
  };

  const handleOpenExplanationModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the checkbox label click from toggling the checkbox
    event.preventDefault();
    event.stopPropagation();
    setRandomnessModalOpened(true);
  };

  return (
    <>
      <Stack gap='sm'>
        <Tooltip
          label={tooltipLabel}
          multiline
          maw={340}
          withArrow
          events={{ hover: true, focus: false, touch: true }}
        >
          <div className={classes.fieldWrapper}>
            <Controller
              name='viewerVerifiableSpin'
              control={control}
              render={({ field: { value } }) => (
                <Checkbox
                  label={
                    <Group gap='xxs' wrap='wrap'>
                      <span>{t('wheel.viewerVerifiableSpin.label')}</span>
                      <Badge color='red' variant='filled' size='sm' radius='sm' className={classes.newBadge}>
                        {t('wheel.viewerVerifiableSpin.newLabel')}
                      </Badge>
                      {!isKnownLoggedOut ? null : <IconExclamationMark size={16} className={classes.warningIcon} />}
                      <ActionIcon
                        variant='outline'
                        color='primary'
                        radius={100}
                        size='compact-sm'
                        onClick={handleOpenExplanationModal}
                        title={t('wheel.randomnessSource.learnMore')}
                      >
                        <IconQuestionMark size={16} />
                      </ActionIcon>
                    </Group>
                  }
                  checked={Boolean(value)}
                  onChange={(event) => handleCheckboxChange(event.currentTarget.checked)}
                  disabled={isDisabled}
                />
              )}
            />
          </div>
        </Tooltip>
        {viewerVerifiableSpin && (ticketData || ticketRateLimitRemainingMs != null) && (
          <TicketCard
            ticketId={ticketData?.ticketId ?? ''}
            createdAt={ticketData?.createdAt ?? ''}
            revealedAt={ticketData?.revealedAt}
            randomNumber={ticketData?.randomNumber}
            rateLimitRemainingMs={ticketRateLimitRemainingMs}
          />
        )}
        {ticketErrorMessage && (
          <Alert icon={<IconAlertCircle size={20} />} title={t('wheel.ticket.errorTitle')} color='red'>
            {ticketErrorMessage}
          </Alert>
        )}
      </Stack>
      <RandomnessExplanationModal
        opened={randomnessModalOpened}
        onClose={() => setRandomnessModalOpened(false)}
        initialTab='verifiable'
      />
    </>
  );
};

export default ViewerVerifiableSpinField;
