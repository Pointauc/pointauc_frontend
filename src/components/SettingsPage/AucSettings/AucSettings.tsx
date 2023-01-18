import React, { FC, useEffect } from 'react';
import { FormGroup, IconButton, MenuItem, Select, Typography } from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import { Controller, UseFormMethods } from 'react-hook-form';
import ArrowUpwardOutlinedIcon from '@material-ui/icons/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ImageLinkInput from '../../Form/ImageLinkInput/ImageLinkInput';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '../../../reducers';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import FormInput from '../../Form/FormInput/FormInput';
import ImagePresetsInput from '../../Form/ImagePresetsInput/ImagePresetsInput';
import { BACKGROUND_PRESETS } from '../../../constants/common.constants';

interface AucSettingsProps {
  control: UseFormMethods['control'];
  register: UseFormMethods['register'];
  setValue: UseFormMethods['setValue'];
}

const AucSettings: FC<AucSettingsProps> = ({ register, control, setValue }) => {
  const { t } = useTranslation();
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { purchaseSort } = settings;

  useEffect(() => {
    register()({ name: 'background', type: 'custom' });
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
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="isBuyoutVisible" control={control} label={t('settings.auc.showBuyout')} />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="isTotalVisible" control={control} label={t('settings.auc.showTotal')} />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="showChances" control={control} label={t('settings.auc.showWinningChances')} />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="MuiFormControlLabel-label">
            {t('settings.auc.background')}
          </Typography>
          <ImageLinkInput
            buttonTitle={t('settings.auc.uploadBackground')}
            buttonClass="upload-background"
            onChange={handleImageChange}
          />
          <ImagePresetsInput
            images={BACKGROUND_PRESETS}
            buttonTitle={t('settings.auc.selectFromList')}
            onChange={handleImageChange}
          />
          <IconButton className="auc-settings-reset-background" onClick={resetBackground}>
            <ReplayIcon />
          </IconButton>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="MuiFormControlLabel-label">
            {t('settings.auc.sortBids')}
          </Typography>
          <Controller
            control={control}
            as={Select}
            name="purchaseSort"
            className="auc-settings-option"
            defaultValue={purchaseSort}
          >
            <MenuItem value={0}>
              <Typography>{t('settings.auc.dateSort')}</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={1}>
              <Typography>{t('settings.auc.dateSort')}</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={2}>
              <Typography>{t('settings.auc.costSort')}</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={3}>
              <Typography>{t('settings.auc.costSort')}</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
          </Controller>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="luckyWheel" control={control} label={t('settings.auc.luckyWheel')} />
        </FormGroup>
        <div className="hint">{t('settings.auc.luckyWheelDesc')}</div>
        <SettingsGroupTitle title={t('settings.marbles.marbles')} />
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="marblesAuc" control={control} label={t('settings.marbles.marbleAuc')} />
        </FormGroup>
        <div className="hint">{t('settings.marbles.marblesAucDesc')}</div>
        <FormGroup row className="auc-settings-row">
          <FormInput
            name="marbleRate"
            control={control}
            label={t('settings.marbles.marbleCost')}
            type="number"
            className="field md"
          />
        </FormGroup>
        <div className="hint">{t('settings.marbles.marbleCostDesc')}</div>
        <FormGroup row className="auc-settings-row">
          <FormInput
            name="marbleCategory"
            control={control}
            label={t('settings.marbles.newPositionCost')}
            type="number"
            className="field md"
          />
        </FormGroup>
        <div className="hint">{t('settings.marbles.newPositionCostDesc')}</div>
      </FormGroup>
    </>
  );
};

export default AucSettings;
