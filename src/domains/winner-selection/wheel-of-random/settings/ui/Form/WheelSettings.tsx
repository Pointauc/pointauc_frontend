import { Alert, Anchor, rem, SimpleGrid, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { CSSProperties, ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';
import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { WheelFormat } from '@constants/wheel.ts';
import { useLocalStorageState } from '@shared/lib/localState/useLocalStorageState';
import ClassicDropoutDescription from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/ClassicDropoutDescription';
import RandomnessSourceField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/RandomnessSourceField/RandomnessSourceField';
import SplitField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/Split';
import WheelFormatField from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/WheelFormat';

import { DropoutVariant } from '../../../BaseWheel/DropoutVariant';
import { DropoutHelp } from '../../../Dropout/ui/DropoutHelp';
import NewDropoutDescription from '../../../Dropout/ui/NewDropoutDescription/NewDropoutDescription';
import { RevealedData } from '../../../lib/hooks/useTicketManagement';
import CoreImageField from '../Fields/CoreImageExpandPanel/CoreImage';
import DropoutFormatField from '../Fields/DropoutFormat';
import WheelSoundtrackField from '../Fields/Soundtrack';
import WheelStyleSelect from '../Fields/StyleSelect/StyleSelect';

interface WheelSettingsProps {
  controls: Wheel.SettingControls;
  children: ReactNode;
  direction?: 'row' | 'column';
  ticketData?: RevealedData | null;
  availableQuota?: number | null;
  ticketError?: Error | null;
}

const WheelSettings = (props: WheelSettingsProps) => {
  const {
    direction = 'column',
    controls,
    children,
    ticketData,
    availableQuota,
    ticketError,
  } = props;
  const { t } = useTranslation();
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });
  const [isNewDropoutFairnessInfoDismissed, setIsNewDropoutFairnessInfoDismissed] = useLocalStorageState(
    'wheelNewDropoutFairnessInfoDismissed',
    false,
  );

  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.settings.page);

  return (
    <>
      <FirstTimeHelpNotification
        featureKey='wheelSettingsHelpSeen'
        title={t('wheel.helpNotification.title')}
        message={
          <Trans
            i18nKey='wheel.helpNotification.message'
            components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' />, 2: <b /> }}
          />
        }
      />
      <SimpleGrid cols={direction === 'row' ? 2 : 1} spacing='md' style={{ minHeight: 0 }}>
        <Stack gap='sm' mih={0}>
          <Stack gap='sm' style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <WheelSoundtrackField />
            <WheelStyleSelect />
            <Stack gap='xxs'>
              {controls.mode && <WheelFormatField />}
              {format === WheelFormat.Dropout && (
                <>
                  <DropoutFormatField />
                  {dropoutVariant === DropoutVariant.New && !isNewDropoutFairnessInfoDismissed && (
                    <Alert
                      variant='light'
                      color='blue'
                      icon={<IconInfoCircle size={32} />}
                      withCloseButton
                      onClose={() => setIsNewDropoutFairnessInfoDismissed(true)}
                      styles={{
                        closeButton: {
                          ...({
                            '--cb-size': rem(26),
                            '--cb-icon-size': rem(20),
                          } as CSSProperties),
                        },
                      }}
                    >
                      {t('wheel.dropout.newVariantFairnessInfo')}
                    </Alert>
                  )}
                  <DropoutHelp />
                  {dropoutVariant === DropoutVariant.New && <NewDropoutDescription />}
                  {dropoutVariant === DropoutVariant.Classic && <ClassicDropoutDescription />}
                </>
              )}
            </Stack>
            {children}
            {controls.split && <SplitField />}
            {controls.randomOrg && (
              <RandomnessSourceField
                ticketData={ticketData}
                availableQuota={availableQuota}
                ticketError={ticketError}
              />
            )}
            {/*{elements.randomPace && (*/}
            {/*  <>*/}
            {/*    <div className='wheel-controls-row'>*/}
            {/*      <Typography>{t('wheel.spicyFinal')}</Typography>*/}
            {/*      <Switch onChange={handleIsRandomPaceChange} />*/}
            {/*    </div>*/}
            {/*    {isRandomPace && (*/}
            {/*      <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />*/}
            {/*    )}*/}
            {/*  </>*/}
            {/*)}*/}
          </Stack>
        </Stack>
        <div style={{ display: 'flex', minHeight: 0, flexDirection: 'column' }}>
          <CoreImageField />
        </div>
      </SimpleGrid>
    </>
  );
};

export default WheelSettings;
