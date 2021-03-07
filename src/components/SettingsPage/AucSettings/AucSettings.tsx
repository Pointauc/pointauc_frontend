import React, { FC, useEffect } from 'react';
import { FormGroup, IconButton, MenuItem, Select, Typography } from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import { Controller, UseFormMethods } from 'react-hook-form';
import ArrowUpwardOutlinedIcon from '@material-ui/icons/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined';
import { useSelector } from 'react-redux';
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
      <SettingsGroupTitle title="Аукцион" />
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="isBuyoutVisible" control={control} label="Показать выкуп" />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="showChances" control={control} label="Показать шансы выигрыша" />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="MuiFormControlLabel-label">
            Фон аукциона
          </Typography>
          <ImageLinkInput buttonTitle="Загрузить фон" buttonClass="upload-background" onChange={handleImageChange} />
          <ImagePresetsInput images={BACKGROUND_PRESETS} buttonTitle="Выбрать из списка" onChange={handleImageChange} />
          <IconButton className="auc-settings-reset-background" onClick={resetBackground}>
            <ReplayIcon />
          </IconButton>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="MuiFormControlLabel-label">
            Сортировать покупки за поинты
          </Typography>
          <Controller
            control={control}
            as={Select}
            name="purchaseSort"
            className="auc-settings-option"
            defaultValue={purchaseSort}
          >
            <MenuItem value={0}>
              <Typography>Дата</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={1}>
              <Typography>Дата</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={2}>
              <Typography>Стоимость</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={3}>
              <Typography>Стоимость</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
          </Controller>
        </FormGroup>
        <SettingsGroupTitle title="Шары" />
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="marblesAuc" control={control} label="Шаровой аукцион" />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormInput name="marbleRate" control={control} label="Стоимость шара" type="number" className="field md" />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormInput
            name="marbleCategory"
            control={control}
            label="Стоимость новой категории"
            type="number"
            className="field md"
          />
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default AucSettings;
