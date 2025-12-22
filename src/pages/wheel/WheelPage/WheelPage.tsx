import { Group, Loader, Title } from '@mantine/core';
import { FC, Key, useCallback, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import PageContainer from '@components/PageContainer/PageContainer';
import { useBroadcastSpin, useWheelBroadcasting } from '@domains/broadcasting/lib/useWheelBroadcasting';
import { SpinStartCallbackParams } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI/index';
import RandomWheel, { RandomWheelController } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';
import { Slot } from '@models/slot.model';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { deleteSlot, initialSlots, setSlots } from '@reducers/Slots/Slots';
import { SlotListToWheelList } from '@utils/slots.utils';
import {
  useSaveWheelSettings,
  useWheelSettings,
} from '@domains/winner-selection/wheel-of-random/lib/hooks/useWheelSettings';

import styles from './WheelPage.module.css';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);
  const wheelForm = useRef<UseFormReturn<Wheel.Settings> | null>(null);

  const [wheelSettings, setWheelSettings] = useState<Wheel.Settings>();
  const [participants, setParticipants] = useState<WheelItem[]>();

  // Load settings from IndexedDB
  const { data: initialSettings, isLoading: isLoadingSettings } = useWheelSettings();
  const { mutate: saveSettings } = useSaveWheelSettings();

  const broadcastSpin = useBroadcastSpin();
  useWheelBroadcasting({ settings: wheelSettings, participants: participants });

  const previousWheelItems = useRef<Slot[]>(initialSlots);
  const wheelItems = useMemo(() => SlotListToWheelList(slots), [slots]);

  if (previousWheelItems.current === initialSlots) {
    previousWheelItems.current = slots;
    wheelController.current?.setItems(wheelItems);
  }

  const setCustomWheelItems = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      wheelController.current?.setItems(SlotListToWheelList(customItems));
      previousWheelItems.current = [];

      if (saveSlots) {
        dispatch(setSlots(customItems));
      }
    },
    [dispatch],
  );

  const deleteItem = (id: Key) => {
    dispatch(deleteSlot(id.toString()));
  };

  const title = (
    <Group>
      <Title order={1}>{t('wheel.wheel')}</Title>
      <SlotsPresetInput buttonTitle={t('wheel.importToWheel')} onChange={setCustomWheelItems} />
    </Group>
  );

  const handleSpinStart = useCallback(
    (params: SpinStartCallbackParams) => {
      broadcastSpin(params.changedDistance ?? 0, params.duration ?? 0, params.winnerItem?.id?.toString() ?? '');
    },
    [broadcastSpin],
  );

  const handleSettingsChanged = useCallback(
    (settings: Wheel.Settings) => {
      setWheelSettings(settings);
      saveSettings({ id: initialSettings?.id, data: settings });
    },
    [saveSettings, initialSettings?.id],
  );

  return (
    <PageContainer
      className={`${styles.container} wheel-wrapper padding`}
      classes={{ content: styles.content }}
      title={title}
    >
      {!isLoadingSettings && (
        <RandomWheel
          initialSettings={initialSettings?.data}
          items={wheelItems}
          deleteItem={deleteItem}
          wheelRef={wheelController}
          onWheelItemsChanged={setParticipants}
          onSettingsChanged={handleSettingsChanged}
          form={wheelForm}
          onSpinStart={handleSpinStart}
        />
      )}
    </PageContainer>
  );
};

export default WheelPage;
