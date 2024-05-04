import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type FieldNamesMarkedBoolean, FormProvider, useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import classNames from 'classnames';
import { useLocation, Location } from 'react-router-dom';

import { RootState } from '@reducers';
import { SettingsForm } from '@models/settings.model.ts';
import PageContainer from '@components/PageContainer/PageContainer.tsx';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils.ts';
import RadioButtonGroup, { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import { integrations } from '@components/Integration/integrations.ts';
import WebsiteSettings from '@pages/settings/AuctionSettings/WebsiteSettings.tsx';
import IntegrationsSettings from '@pages/settings/IntegrationsSettings/IntegrationsSettings.tsx';

import './NewSettingsPage.scss';
import type { ThunkDispatch } from 'redux-thunk';

type SettingGroup = 'auc' | 'integrations';

interface PageState {
  subpage: SettingGroup;
}

const NewSettingsPage = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const [settingGroup, setSettingGroup] = React.useState<SettingGroup>('auc');

  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const formMethods = useForm<SettingsForm>({ defaultValues: settings, mode: 'onBlur' });

  const location: Location<PageState | null> = useLocation();
  useEffect(() => {
    if (location.state?.subpage) {
      setSettingGroup(location.state.subpage);
    }
  }, [location.state?.subpage]);

  const {
    handleSubmit,
    reset,
    getValues,
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
            <Grid container item gap={1}>
              <Grid item xs={4}>
                <RadioButtonGroup
                  fullWidth
                  size='large'
                  options={settingsGroupOptions}
                  activeKey={settingGroup}
                  onChangeActive={setSettingGroup}
                />
              </Grid>
              <Grid item xs={8}></Grid>
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
