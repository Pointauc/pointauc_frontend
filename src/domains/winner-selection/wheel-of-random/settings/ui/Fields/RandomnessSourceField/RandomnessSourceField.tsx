import { Alert, Anchor, Group, Select, Stack, Text, Tooltip } from '@mantine/core';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { IconAlertCircle, IconShieldCheckFilled } from '@tabler/icons-react';

import { WheelFormat } from '@constants/wheel.ts';
import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import TicketCard from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/TicketCard/TicketCard';
import RandomnessExplanationModal from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/RandomnessExplanationModal';
import { RevealedData } from '@domains/winner-selection/wheel-of-random/lib/hooks/useTicketManagement';

import classes from './RandomnessSourceField.module.css';

interface RandomnessSourceFieldProps {
  ticketData?: RevealedData | null;
  availableQuota?: number | null;
  ticketError?: Error | null;
}

const MODAL_OPENED_KEY = 'randomnessModalHasBeenOpened';

/**
 * Randomness source selection field with integrated side effects:
 * - Auto-opens explanation modal for first-time random-org-signed users
 * - Auto-resets to local-basic for restricted wheel types
 * - Displays ticket card for random-org-signed
 * - Handles ticket errors
 */
const RandomnessSourceField = ({ ticketData, availableQuota, ticketError }: RandomnessSourceFieldProps) => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });
  const randomnessSource = useWatch<Wheel.Settings>({ name: 'randomnessSource' });
  const [randomnessModalOpened, setRandomnessModalOpened] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<'local-basic' | 'random-org' | 'random-org-signed'>();

  // Auto-open modal for random-org-signed if it hasn't been opened before
  useEffect(() => {
    if (randomnessSource === 'random-org-signed') {
      const hasBeenOpened = localStorage.getItem(MODAL_OPENED_KEY);
      if (!hasBeenOpened) {
        setRandomnessModalOpened(true);
        localStorage.setItem(MODAL_OPENED_KEY, 'true');
      }
    }
  }, [randomnessSource]);

  // Auto-reset randomnessSource to 'local-basic' for restricted wheel types
  useEffect(() => {
    const isRestrictedWheel =
      format === WheelFormat.BattleRoyal ||
      (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

    if (isRestrictedWheel && randomnessSource !== 'local-basic') {
      setValue('randomnessSource', 'local-basic');
    }
  }, [format, dropoutVariant, randomnessSource, setValue]);

  const isRestrictedWheel =
    format === WheelFormat.BattleRoyal || (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

  const randomnessOptions = [
    { value: 'local-basic', label: t('wheel.randomnessSource.localBasic') },
    { value: 'random-org', label: t('wheel.randomnessSource.randomOrg'), disabled: isRestrictedWheel },
    {
      value: 'random-org-signed',
      label: t('wheel.randomnessSource.randomOrgSigned'),
      disabled: isRestrictedWheel,
    },
  ];

  const ticketErrorMessage = useMemo(() => {
    if (randomnessSource !== 'random-org-signed' || !ticketError) return null;
    if (randomnessSource === 'random-org-signed' && (ticketError as AxiosError)?.status === 403) {
      return t('wheel.ticket.unauthorizedError');
    }
    return t('wheel.ticket.unknownError');
  }, [ticketError, randomnessSource, t]);

  const handleOpenRandomnessModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInitialModalTab(undefined);
    setRandomnessModalOpened(true);
  };

  const handleCloseModal = () => {
    setRandomnessModalOpened(false);
    setInitialModalTab(undefined);
  };

  const renderSelectOption: Parameters<typeof Select>[0]['renderOption'] = ({ option }) => {
    if (option.value === 'random-org-signed') {
      return (
        <Stack gap={0}>
          <Group gap='xxs' align='center'>
            <IconShieldCheckFilled size={20} className={classes.lockIcon} />
            <Text>{option.label}</Text>
          </Group>
          <Text size='xs' c='dimmed'>
            {t('wheel.randomnessSource.verifiableDescription')}
          </Text>
        </Stack>
      );
    }
    return option.label;
  };

  return (
    <>
      <Stack gap='sm'>
        <Controller
          name='randomnessSource'
          render={({ field: { value, onChange } }) => (
            <Tooltip label={t('wheel.randomnessSource.disabledTooltip')} disabled={!isRestrictedWheel} withArrow>
              <Select
                classNames={{ label: 'w-full' }}
                label={
                  <Group gap='xs' justify='space-between' wrap='nowrap' w='100%'>
                    <Text>{t('wheel.randomnessSource.label')}</Text>
                    <Anchor size='sm' onClick={handleOpenRandomnessModal} style={{ whiteSpace: 'nowrap' }}>
                      {t('wheel.randomnessSource.learnMore')}
                    </Anchor>
                  </Group>
                }
                value={value}
                onChange={(val) => onChange(val)}
                data={randomnessOptions}
                disabled={isSubmitting}
                allowDeselect={false}
                renderOption={renderSelectOption}
              />
            </Tooltip>
          )}
        />
        {randomnessSource === 'random-org-signed' && ticketData && (
          <TicketCard
            ticketId={ticketData.ticketId}
            createdAt={ticketData.createdAt}
            revealedAt={ticketData?.revealedAt}
            randomNumber={ticketData?.randomNumber}
            availableQuota={availableQuota}
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
        onClose={handleCloseModal}
        initialTab={initialModalTab}
      />
    </>
  );
};

export default RandomnessSourceField;
