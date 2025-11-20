import { Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowBigRightFilled, IconTransfer } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import PointsIcon from '@assets/icons/channelPoints.svg?react';
import FormInput from '@shared/mantine/ui/Input/FormInput';

import classes from './index.module.css';

const examplePresets = [50, 100, 200];

const ExchangeRate = () => {
  const { control, setValue } = useFormContext();
  const { t } = useTranslation();

  const pointsRate = useWatch({ name: 'pointsRate' });
  const reversePointsRate = useWatch({ name: 'reversePointsRate' });
  const showExample = pointsRate > 1;

  return (
    <Group align='flex-start'>
      <Text lh={'42px'}>{t('settings.donations.conversion')}</Text>
      <Stack gap='xxs'>
        <Group align='center'>
          <Text>{`1 ${t('common.currencySign')}`}</Text>
          <IconArrowBigRightFilled
            className={clsx(classes.conversionDirectionArrow, { [classes.reversed]: reversePointsRate })}
          />
          <FormInput
            name='pointsRate'
            control={control}
            type='number'
            w={110}
            rightSection={<PointsIcon width={20} height={20} />}
          />
          <Button
            variant='transparent'
            onClick={() => setValue('reversePointsRate', !reversePointsRate, { shouldDirty: true, shouldTouch: true })}
          >
            <Group align='center' gap='xxs'>
              <Text>{t('settings.donations.switchRates')}</Text>
              <IconTransfer />
            </Group>
          </Button>
        </Group>
        {showExample && (
          <Text size='sm' color='dimmed'>
            {examplePresets
              .map((money) => `${money} ${t('common.currencySign')} > ${(money * pointsRate).toLocaleString()}`)
              .join(' | ')}
          </Text>
        )}
      </Stack>
    </Group>
  );
};

export default ExchangeRate;
