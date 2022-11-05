import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PageContainer from '../PageContainer/PageContainer';
import StopwatchSettings from './StopwatchSettings/StopwatchSettings';
import { RootState } from '../../reducers';
import { initialState, setAucSettings, SettingFields } from '../../reducers/AucSettings/AucSettings';
import AucSettings from './AucSettings/AucSettings';
import './SettingsPage.scss';
import LoadingButton from '../LoadingButton/LoadingButton';
import withLoading from '../../decorators/withLoading';
import { updateSettings } from '../../api/userApi';
import { getDirtyValues } from '../../utils/common.utils';
import ConfirmFormOnLeave from '../ConfirmFormOnLeave/ConfirmFormOnLeave';

const SettingsPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { username } = useSelector((root: RootState) => root.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formMethods = useForm<SettingFields>({ defaultValues: settings });
  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
    reset,
    control,
    register,
    setValue,
  } = formMethods;

  useEffect(() => {
    reset(settings);
  }, [reset, settings]);

  const handleReset = useCallback(() => reset(), [reset]);
  const onSubmit = useCallback(
    (data) =>
      withLoading(setIsSubmitting, async () => {
        dispatch(setAucSettings(data));

        if (username) {
          await updateSettings(getDirtyValues(data, dirtyFields, initialState.settings));
        }
      })(),
    [dirtyFields, dispatch, username],
  );

  return (
    <PageContainer title={t('settings.settings')} classes={{ root: 'settings' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ConfirmFormOnLeave isDirtyForm={isDirty} onSubmit={handleSubmit(onSubmit)} />
        <StopwatchSettings control={control} />
        <AucSettings control={control} register={register} setValue={setValue} />
        <div style={{ marginTop: 40 }}>
          <LoadingButton
            isLoading={isSubmitting}
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginRight: 20 }}
            disabled={!isDirty || isSubmitting}
          >
            {t('common.apply')}
          </LoadingButton>
          <Button onClick={handleReset} variant="outlined" disabled={!isDirty}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

export default SettingsPage;
