import { ActionIcon, Checkbox, Group, Tooltip } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { WheelFormat } from '@constants/wheel.ts';
import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/DropoutVariant';
import RandomnessExplanationModal from '@domains/winner-selection/wheel-of-random/settings/ui/RandomnessExplanationModal/RandomnessExplanationModal';

const RANDOMNESS_SOURCES = ['local-basic', 'random-org'] as const;

/**
 * "Use random.org" checkbox backed by the randomnessSource setting
 * ('random-org' when checked, 'local-basic' when unchecked) with integrated
 * side effects:
 * - Auto-unchecks for restricted wheel types (battle royale, classic dropout)
 * - Opens the explanation modal via the question mark icon button
 */
const RandomnessSourceField = () => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const format = useWatch<Wheel.Settings, 'format'>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings, 'dropoutVariant'>({ name: 'dropoutVariant' });
  const randomnessSource = useWatch<Wheel.Settings, 'randomnessSource'>({ name: 'randomnessSource' });
  const [randomnessModalOpened, setRandomnessModalOpened] = useState(false);

  // Normalize legacy values (e.g. the removed 'random-org-signed'). Skip the
  // transient undefined state while the watch value has not hydrated yet,
  // otherwise a saved 'random-org' could be reset on page refresh
  useEffect(() => {
    if (randomnessSource !== undefined && !RANDOMNESS_SOURCES.includes(randomnessSource)) {
      setValue('randomnessSource', 'local-basic');
    }
  }, [randomnessSource, setValue]);

  const isRestrictedWheel =
    format === WheelFormat.BattleRoyal || (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic);

  // Auto-uncheck for restricted wheel types
  useEffect(() => {
    if (isRestrictedWheel && randomnessSource !== 'local-basic') {
      setValue('randomnessSource', 'local-basic');
    }
  }, [isRestrictedWheel, randomnessSource, setValue]);

  const handleCheckboxChange = (checked: boolean) => {
    setValue('randomnessSource', checked ? 'random-org' : 'local-basic');
  };

  const handleOpenExplanationModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the checkbox label click from toggling the checkbox
    event.preventDefault();
    event.stopPropagation();
    setRandomnessModalOpened(true);
  };

  return (
    <>
      <Tooltip
        label={t('wheel.randomnessSource.disabledTooltip')}
        disabled={!isRestrictedWheel}
        multiline
        maw={340}
        withArrow
        events={{ hover: true, focus: false, touch: true }}
      >
        <div>
          <Controller
            name='randomnessSource'
            control={control}
            render={({ field: { value } }) => (
              <Checkbox
                label={
                  <Group gap='xxs' wrap='nowrap'>
                    <span>{t('wheel.randomnessSource.useRandomOrg')}</span>
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
                checked={value === 'random-org'}
                onChange={(event) => handleCheckboxChange(event.currentTarget.checked)}
                disabled={isSubmitting || isRestrictedWheel}
              />
            )}
          />
        </div>
      </Tooltip>
      <RandomnessExplanationModal
        opened={randomnessModalOpened}
        onClose={() => setRandomnessModalOpened(false)}
        initialTab='random-org'
      />
    </>
  );
};

export default RandomnessSourceField;
