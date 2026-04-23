import { Box, Stack } from '@mantine/core';
import { useCallback, useEffect, useRef, useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import PageContainer from '@components/PageContainer/PageContainer.tsx';
import SettingsSidebar from '@domains/user-settings-v2/ui/SettingsSidebar';
import SettingsTableOfContents from '@domains/user-settings-v2/ui/SettingsTableOfContents';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers/index';
import AppearanceSection from '@domains/user-settings-v2/Widgets/appearance/AppearanceSection';
import ExtraModesSection from '@domains/user-settings-v2/Widgets/extra-modes/ExtraModesSection';
import TimerSection from '@domains/user-settings-v2/Widgets/timer/TimerSection';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils';
import { settingsApi } from '@api/userApi';

import styles from './WebsiteSettings.module.css';

const WEBSITE_SETTINGS_CONTENT_ID = 'website-settings-content';

const WebsiteSettings = () => {
  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [, startTransition] = useTransition();

  const formMethods = useForm<SettingsForm>({
    defaultValues: settings,
    mode: 'onBlur',
  });

  const {
    reset,
    formState: { dirtyFields, touchedFields },
    getValues,
    handleSubmit,
  } = formMethods;

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    reset(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onSubmit = useCallback(
    (data: SettingsForm, dirtyValues: Partial<SettingsForm>) => {
      dispatch(saveSettings(dirtyValues));
      reset({ ...data, ...dirtyValues });
    },
    [dispatch, reset],
  );

  useEffect(() => {
    const normalizedTouched = {
      ...touchedFields,
      background: true,
      primaryColor: true,
      backgroundTone: true,
    };

    const dirtyValues = getDirtyValues(getValues(), dirtyFields, initialState.settings, normalizedTouched);

    if (Object.keys(dirtyValues).length > 0) {
      startTransition(() => {
        settingsApi.preset.setActiveData(dirtyValues);
      });

      void handleSubmit((data) => onSubmit(data, dirtyValues))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dirtyFields), JSON.stringify(touchedFields), handleSubmit, onSubmit]);

  return (
    <FormProvider {...formMethods}>
      <form>
        <PageContainer contentId={WEBSITE_SETTINGS_CONTENT_ID} contentRef={contentRef} className='h-full'>
          <Box className={styles.layout}>
            <Box className={styles.sidebarColumn}>
              <SettingsSidebar />
            </Box>

            <Box className={styles.contentColumn}>
              <Stack className={styles.contentStack} gap='xl'>
                <TimerSection />
                <AppearanceSection />
                <ExtraModesSection />
              </Stack>
            </Box>

            <Box className={styles.tocColumn}>
              <SettingsTableOfContents contentId={WEBSITE_SETTINGS_CONTENT_ID} contentRef={contentRef} />
            </Box>
          </Box>
        </PageContainer>
      </form>
    </FormProvider>
  );
};

export default WebsiteSettings;
