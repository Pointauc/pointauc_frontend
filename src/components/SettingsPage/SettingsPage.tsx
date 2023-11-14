import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import { RootState } from '@reducers';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils.ts';
import { SettingsForm } from '@models/settings.model.ts';
import AppearanceSettings from '@components/SettingsPage/AppearanceSettings';

import AucSettings from './AucSettings/AucSettings';
import StopwatchSettings from './StopwatchSettings/StopwatchSettings';

import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import type { ThunkDispatch } from 'redux-thunk';
import './SettingsPage.scss';

const SettingsPage: FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();

  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const formMethods = useForm<SettingsForm>({ defaultValues: settings, mode: 'onBlur' });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    register,
    setValue,
    formState: { dirtyFields, touchedFields },
  } = formMethods;

  const onSubmit = useCallback(
    (data: SettingsForm, dirty: Partial<SettingsForm>) => {
      dispatch(saveSettings(dirty));
      reset({ ...data, ...dirty });
    },
    [dispatch, reset],
  );

  useEffect(() => {
    reset(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    const normalizedTouched: FieldNamesMarkedBoolean<SettingsForm> = { ...touchedFields, background: true };
    const dirtyValues = getDirtyValues(getValues(), dirtyFields, initialState.settings, normalizedTouched);

    if (Object.keys(dirtyValues).length > 0) {
      handleSubmit((data) => onSubmit(data, dirtyValues))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dirtyFields), JSON.stringify(touchedFields), handleSubmit, onSubmit]);

  return (
    <PageContainer title={t('settings.settings')} classes={{ root: 'settings' }}>
      <FormProvider {...formMethods}>
        <form>
          <StopwatchSettings control={control} />
          <AucSettings control={control} register={register} setValue={setValue} />
          <AppearanceSettings />
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default SettingsPage;
