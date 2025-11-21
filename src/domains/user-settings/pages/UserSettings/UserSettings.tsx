import { Group, Tabs, Title, ScrollArea } from '@mantine/core';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useTransition } from 'react';
import { FormProvider, useForm, type FieldNamesMarkedBoolean } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useMatch, useNavigate } from 'react-router-dom';

import { settingsApi } from '@api/userApi.ts';
import { integrations } from '@components/Integration/integrations.ts';
import PageContainer from '@components/PageContainer/PageContainer.tsx';
import { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import ROUTES from '@constants/routes.constants.ts';
import { AucSettingsDto, SettingsForm } from '@models/settings.model.ts';
import WebsiteSettings from '@domains/user-settings/Widgets/General/WebsiteSettings';
import IntegrationsSettings from '@pages/settings/IntegrationsSettings/IntegrationsSettings.tsx';
import { RootState } from '@reducers';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils.ts';
import SettingsPresetField from '@domains/user-settings/ui/SettingsPresetField';

import styles from './UserSettings.module.css';

import type { ThunkDispatch } from 'redux-thunk';

type SettingGroup = 'auc' | 'integrations';

const UserSettings = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();

  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const formMethods = useForm<SettingsForm>({ defaultValues: settings, mode: 'onBlur' });

  const isIntegrationsOpened = useMatch(ROUTES.INTEGRATIONS);
  const initialSettingGroup = isIntegrationsOpened ? 'integrations' : 'auc';
  const navigate = useNavigate();
  const changeSettingsGroup = (group: string | null) => {
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
      <Group align='center' gap='xxs'>
        <div style={{ marginRight: 8 }}>{t('settings.groups.integrations')}</div>
        {integrations.all.map((integration) => (
          <integration.branding.icon key={integration.id} className={classNames('base-icon', integration.id)} />
        ))}
      </Group>
    );
    return [
      { key: 'auc', label: t('settings.groups.auc') },
      { key: 'integrations', label: integrationsLabel },
    ];
  }, [t]);

  return (
    <FormProvider {...formMethods}>
      <form>
        <PageContainer
          title={
            <Group justify='space-between' align='center'>
              <Title order={1}>{t('settings.pageTitle')}</Title>
              <SettingsPresetField allSettings={settings} onChange={onPresetChange} />
            </Group>
          }
          className={styles.pageContainer}
          classes={{ content: styles.pageContent }}
        >
          <Tabs
            keepMounted={false}
            value={initialSettingGroup}
            onChange={changeSettingsGroup}
            classNames={{ tab: styles.tabLabel, root: styles.root, panel: styles.panel, list: styles.list }}
          >
            <Tabs.List>
              {settingsGroupOptions.map((option) => (
                <Tabs.Tab key={option.key} value={option.key}>
                  {option.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            <ScrollArea
              h='100%'
              type='always'
              scrollbars='y'
              scrollbarSize={6}
              offsetScrollbars={true}
              classNames={{ viewport: styles.scrollArea }}
            >
              <Tabs.Panel value='auc'>
                <WebsiteSettings />
              </Tabs.Panel>
              <Tabs.Panel value='integrations'>
                <IntegrationsSettings />
              </Tabs.Panel>
            </ScrollArea>
          </Tabs>
        </PageContainer>
      </form>
    </FormProvider>
  );
};

export default UserSettings;
