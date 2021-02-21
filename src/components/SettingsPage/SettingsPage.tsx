import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
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
        if (username) {
          await updateSettings(getDirtyValues(data, dirtyFields, initialState.settings));
        }

        return dispatch(setAucSettings(data));
      })(),
    [dirtyFields, dispatch, username],
  );

  return (
    <PageContainer title="Настройки" classes={{ root: 'settings' }}>
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
            Применить
          </LoadingButton>
          <Button onClick={handleReset} variant="outlined" disabled={!isDirty}>
            Отменить
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

export default SettingsPage;
