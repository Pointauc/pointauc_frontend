import React, { useCallback, useEffect, useMemo, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type FieldNamesMarkedBoolean, FormProvider, useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import classNames from 'classnames';
import { useMatch, useNavigate } from 'react-router-dom';

import { RootState } from '@reducers';
import { AucSettingsDto, SettingsForm } from '@models/settings.model.ts';
import PageContainer from '@components/PageContainer/PageContainer.tsx';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils.ts';
import RadioButtonGroup, { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import { integrations } from '@components/Integration/integrations.ts';
import WebsiteSettings from '@pages/settings/AuctionSettings/WebsiteSettings.tsx';
import IntegrationsSettings from '@pages/settings/IntegrationsSettings/IntegrationsSettings.tsx';
import SettingsPresetField from '@pages/settings/SettingsPresetField';
import { settingsApi } from '@api/userApi.ts';
import ROUTES from '@constants/routes.constants.ts';

import './NewSettingsPage.scss';

import type { ThunkDispatch } from 'redux-thunk';

type SettingGroup = 'auc' | 'integrations';

const NewSettingsPage = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();

  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const formMethods = useForm<SettingsForm>({ defaultValues: settings, mode: 'onBlur' });

  const isIntegrationsOpened = useMatch(ROUTES.INTEGRATIONS);
  const settingGroup = isIntegrationsOpened ? 'integrations' : 'auc';
  const navigate = useNavigate();
  const changeSettingsGroup = (group: SettingGroup) => {
    navigate(group === 'integrations' ? ROUTES.INTEGRATIONS : ROUTES.SETTINGS);
  };

  const {
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, touchedFields },
  } = formMethods;

  const [_, startTransition] = useTransition();
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
      startTransition(() => {
        settingsApi.preset.setActiveData(dirtyValues);
      });
      handleSubmit((data) => onSubmit(data, dirtyValues))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dirtyFields), JSON.stringify(touchedFields), handleSubmit, onSubmit]);

  const onPresetChange = (presetData: AucSettingsDto) => {
    handleSubmit((data) => onSubmit(data, presetData))();
  };

  const settingsGroupOptions = useMemo<Option<SettingGroup>[]>(() => {
    const integrationsLabel = (
      <Grid container alignItems='center'>
        <div style={{ marginRight: 8 }}>{t('settings.groups.integrations')}</div>
        {integrations.all.map((integration) => (
          <integration.branding.icon key={integration.id} className={classNames('base-icon', integration.id)} />
        ))}
      </Grid>
    );
    return [
      { key: 'auc', label: t('settings.groups.auc') },
      { key: 'integrations', label: integrationsLabel },
    ];
  }, [t]);

  return (
    <PageContainer title={t('settings.pageTitle')} className='new-search-page' classes={{ root: 'settings' }}>
      <FormProvider {...formMethods}>
        <form>
          <Grid container gap={3} direction='column'>
            <Grid container item justifyContent='space-between'>
              <Grid item xs={4}>
                <RadioButtonGroup
                  fullWidth
                  size='large'
                  options={settingsGroupOptions}
                  activeKey={settingGroup}
                  onChangeActive={changeSettingsGroup}
                />
              </Grid>
              <Grid item>
                <SettingsPresetField allSettings={settings} onChange={onPresetChange} />
              </Grid>
            </Grid>
            <Grid item>
              {settingGroup === 'auc' && <WebsiteSettings />}
              {settingGroup === 'integrations' && <IntegrationsSettings />}
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default NewSettingsPage;
