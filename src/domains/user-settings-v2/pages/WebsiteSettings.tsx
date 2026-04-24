import { Box, Stack } from '@mantine/core';
import { useAsyncDebouncer } from '@tanstack/react-pacer/async-debouncer';
import { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import PageContainer from '@components/PageContainer/PageContainer.tsx';
import SettingsSidebar from '@domains/user-settings-v2/ui/SettingsSidebar';
import SettingsTableOfContents from '@domains/user-settings-v2/ui/SettingsTableOfContents';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers/index';
import AppearanceSection from '@domains/user-settings-v2/Widgets/appearance/AppearanceSection';
import ChannelPointsSection from '@domains/user-settings-v2/Widgets/channel-points/ChannelPointsSection';
import BidsGeneralSection from '@domains/user-settings-v2/Widgets/bids-general/BidsGeneralSection';
import ExtraModesSection from '@domains/user-settings-v2/Widgets/extra-modes/ExtraModesSection';
import TimerSection from '@domains/user-settings-v2/Widgets/timer/TimerSection';
import DonationSection from '@domains/user-settings-v2/Widgets/donations/DonationSection';
import ApiSection from '@domains/user-settings-v2/Widgets/api/ApiSection';
import { initialState, saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils';
import { settingsApi } from '@api/userApi';

import styles from './WebsiteSettings.module.css';

const WEBSITE_SETTINGS_CONTENT_ID = 'website-settings-content';
const WEBSITE_SETTINGS_AUTOSAVE_WAIT = 200;

interface WebsiteSettingsAutosavePayload {
  dirtyValues: Partial<SettingsForm>;
  changeVersion: number;
}

const WebsiteSettings = () => {
  const { username } = useSelector((root: RootState) => root.user);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const formMethods = useForm<SettingsForm>({
    defaultValues: settings,
    mode: 'onBlur',
  });

  const contentRef = useRef<HTMLDivElement | null>(null);
  const latestChangeVersionRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const autosaveDebouncer = useAsyncDebouncer(
    async ({ dirtyValues, changeVersion }: WebsiteSettingsAutosavePayload) => {
      const saveNextSettings = async () => {
        await formMethods.handleSubmit(async (values) => {
          await settingsApi.preset.setActiveData(dirtyValues);
          await dispatch(saveSettings(dirtyValues));

          if (latestChangeVersionRef.current === changeVersion) {
            formMethods.reset({ ...values, ...dirtyValues });
          }
        })();
      };

      saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(saveNextSettings);

      await saveQueueRef.current;
    },
    {
      wait: WEBSITE_SETTINGS_AUTOSAVE_WAIT,
      onError: (err) => {
        console.error('Failed to autosave website settings', err);
      },
    },
  );

  useEffect(() => {
    latestChangeVersionRef.current += 1;
    autosaveDebouncer.cancel();
    formMethods.reset(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    const unsubscribe = formMethods.subscribe({
      formState: {
        values: true,
        dirtyFields: true,
        touchedFields: true,
      },
      callback: ({ values, dirtyFields, touchedFields }) => {
        const changeVersion = latestChangeVersionRef.current + 1;
        latestChangeVersionRef.current = changeVersion;

        const dirtyValues = getDirtyValues(
          (values ?? formMethods.getValues()) as SettingsForm,
          dirtyFields,
          initialState.settings,
          touchedFields,
        );

        if (Object.keys(dirtyValues).length === 0) {
          return;
        }

        void autosaveDebouncer.maybeExecute({
          dirtyValues,
          changeVersion,
        });
      },
    });

    return () => {
      autosaveDebouncer.cancel();
      unsubscribe();
    };
  }, [autosaveDebouncer, formMethods]);

  return (
    <FormProvider {...formMethods}>
      <form className='w-full'>
        <PageContainer
          contentId={WEBSITE_SETTINGS_CONTENT_ID}
          contentRef={contentRef}
          className='h-full'
          classes={{ content: styles.pageContent }}
          padding={false}
        >
          <Box className={styles.layout}>
            <Box className={styles.contentColumn}>
              <Stack className={styles.contentStack} gap='xxl'>
                <TimerSection />
                <AppearanceSection />
                <BidsGeneralSection />
                <ChannelPointsSection />
                <DonationSection />
                <ExtraModesSection />
                <ApiSection />
              </Stack>
            </Box>

            <Box className={styles.tocColumn}>
              <SettingsTableOfContents contentId={WEBSITE_SETTINGS_CONTENT_ID} contentRef={contentRef} />
              <SettingsSidebar />
            </Box>
          </Box>
        </PageContainer>
      </form>
    </FormProvider>
  );
};

export default WebsiteSettings;
