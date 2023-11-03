import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FieldNamesMarkedBoolean } from 'react-hook-form/dist/types/form';
import PageContainer from '../PageContainer/PageContainer';
import TwitchIntegration from './TwitchIntegration/TwitchIntegration';
import { RootState } from '../../reducers';
import { initialState, saveSettings } from '../../reducers/AucSettings/AucSettings';
import DaIntegration from './DAIntegration/DAIntegration';
import { getDirtyValues } from '../../utils/common.utils';
import './IntegrationPage.tsx.scss';
import { SettingsForm } from '../../models/settings.model';

const IntegrationPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const formMethods = useForm<SettingsForm>({ defaultValues: settings, mode: 'onBlur' });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, touched },
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
    const normalizedTouched: FieldNamesMarkedBoolean<SettingsForm> = { ...touched, background: true };
    const dirtyValues = getDirtyValues(getValues(), dirtyFields, initialState.settings, normalizedTouched);

    if (Object.keys(dirtyValues).length > 0) {
      handleSubmit((data) => onSubmit(data, dirtyValues))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dirtyFields), JSON.stringify(touched), handleSubmit, onSubmit]);

  return (
    <PageContainer title={t('settings.integrations')} className="integration-page">
      <form className="settings">
        <TwitchIntegration control={control} />
        <DaIntegration control={control} />
      </form>
    </PageContainer>
  );
};

export default IntegrationPage;
