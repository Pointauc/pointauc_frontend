import { FC, useEffect } from 'react';
import { FormGroup, IconButton, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { Control, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';
import FormInput from '@components/Form/FormInput/FormInput';
import ImagePresetsInput from '@components/Form/ImagePresetsInput/ImagePresetsInput';
import { BACKGROUND_PRESETS } from '@constants/common.constants.ts';
import BidsSortSelect from '@components/SettingsPage/AucSettings/BidsSortSelect.tsx';

interface AucSettingsProps {
  control: Control;
  register: UseFormReturn['register'];
  setValue: UseFormReturn['setValue'];
}

const AucSettings: FC<AucSettingsProps> = ({ register, control, setValue }) => {
  const { t } = useTranslation();

  useEffect(() => {
    register('background');
  }, [register]);

  const handleImageChange = (image: string): void => {
    setValue('background', image, { shouldDirty: true });
  };

  const resetBackground = (): void => {
    setValue('background', null, { shouldDirty: true });
  };

  return (
    <>
      <SettingsGroupTitle title={t('settings.auc.auc')} />
      <FormGroup className='auc-settings-list'>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='isTotalVisible' control={control} label={t('settings.auc.showTotal')} />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='showChances' control={control} label={t('settings.auc.showWinningChances')} />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='hideAmounts' control={control} label={t('settings.auc.hideAmounts')} />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.auc.background')}
          </Typography>
          <ImageLinkInput
            buttonTitle={t('settings.auc.uploadBackground')}
            buttonClass='upload-background'
            onChange={handleImageChange}
          />
          <ImagePresetsInput
            images={BACKGROUND_PRESETS}
            buttonTitle={t('settings.auc.selectFromList')}
            onChange={handleImageChange}
          />
          <IconButton className='auc-settings-reset-background' onClick={resetBackground} size='large'>
            <ReplayIcon />
          </IconButton>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <Typography variant='body1' className='MuiFormControlLabel-label'>
            {t('settings.auc.sortBids')}
          </Typography>
          <BidsSortSelect control={control} />
        </FormGroup>

        <SettingsGroupTitle title={t('settings.marbles.marbles')} />
        <FormGroup row className='auc-settings-row'>
          <FormSwitch
            name='marblesAuc'
            control={control}
            label={t('settings.marbles.marbleAuc')}
            hint={t('settings.marbles.marblesAucDesc')}
          />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormInput
            name='marbleRate'
            control={control}
            label={t('settings.marbles.marbleCost')}
            type='number'
            className='field md'
            hint={t('settings.marbles.marbleCostDesc')}
          />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormInput
            name='marbleCategory'
            control={control}
            label={t('settings.marbles.newPositionCost')}
            type='number'
            className='field md'
            hint={t('settings.marbles.newPositionCostDesc')}
          />
        </FormGroup>

        <SettingsGroupTitle title={t('settings.luckyWheel.groupTitle')} />
        <FormGroup row className='auc-settings-row'>
          <FormSwitch
            name='luckyWheelEnabled'
            control={control}
            label={t('settings.luckyWheel.luckyWheel')}
            hint={t('settings.luckyWheel.desc')}
          />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='luckyWheelSelectBet' control={control} label={t('settings.luckyWheel.selectBet')} />
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default AucSettings;
