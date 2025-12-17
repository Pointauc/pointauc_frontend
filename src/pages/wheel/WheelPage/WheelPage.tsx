import { Group, Title } from '@mantine/core';
import { FC, Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { UseFormReturn } from 'react-hook-form';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import PageContainer from '@components/PageContainer/PageContainer';
import RandomWheel, { RandomWheelController } from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';
import { Slot } from '@models/slot.model';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { deleteSlot, setSlots } from '@reducers/Slots/Slots';
import { slotToWheel } from '@utils/slots.utils';
import { useBroadcastSpin, useWheelBroadcasting } from '@domains/broadcasting/lib/useWheelBroadcasting';
import { WheelFormat } from '@constants/wheel';
import { skipSameValueCalls } from '@utils/dataType/function.utils';
import { SpinParams } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';

import styles from './WheelPage.module.css';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);
  const wheelForm = useRef<UseFormReturn<Wheel.Settings> | null>(null);

  const [wheelSettings, setWheelSettings] = useState<Wheel.Settings>();
  const [participants, setParticipants] = useState<WheelItem[]>();

  const broadcastSpin = useBroadcastSpin();
  useWheelBroadcasting({ settings: wheelSettings, participants: participants });

  const wheelItems = useMemo(() => slots.map<WheelItem>(slotToWheel), [slots]);

  const setCustomWheelItems = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      wheelController.current?.setItems(customItems.map(slotToWheel) as any);

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
    (params: SpinParams) => {
      broadcastSpin(params.distance ?? 0, params.duration ?? 0, params.winner?.toString() ?? '');
    },
    [broadcastSpin],
  );

  return (
    <PageContainer
      className={`${styles.container} wheel-wrapper padding`}
      classes={{ content: styles.content }}
      title={title}
    >
      <RandomWheel
        items={wheelItems}
        deleteItem={deleteItem}
        wheelRef={wheelController}
        onWheelItemsChanged={setParticipants}
        onSettingsChanged={setWheelSettings}
        form={wheelForm}
        onSpinStart={handleSpinStart}
      />
    </PageContainer>
  );
};

export default WheelPage;
