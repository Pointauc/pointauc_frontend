import { Group } from '@mantine/core';
import { FC, Key, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useWheelBroadcasting } from '@domains/broadcasting/lib/useWheelBroadcasting';
import { WheelFormat } from '@constants/wheel';
import { skipSameValueCalls } from '@utils/dataType/function.utils';
import { SpinParams } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);
  const wheelForm = useRef<UseFormReturn<Wheel.Settings> | null>(null);
  const { broadcastParticipantsChanged, broadcastSpin, broadcastSettingsChanged } = useWheelBroadcasting();

  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.wheel);

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
      <span>{t('wheel.wheel')}</span>
      <SlotsPresetInput buttonTitle={t('wheel.importToWheel')} onChange={setCustomWheelItems} />
    </Group>
  );

  const parseSettingsForBroadcast = useCallback((settings: Partial<Wheel.Settings>) => {
    return {
      format: settings.format ?? WheelFormat.Default,
      coreImage: settings.coreImage ?? undefined,
    };
  }, []);

  const broadcastSettings = useMemo(() => {
    return skipSameValueCalls(broadcastSettingsChanged, { compareNested: true });
  }, [broadcastSettingsChanged]);

  useEffect(() => {
    if (wheelForm.current && isBroadcastEnabled) {
      broadcastSettings.callThrough(parseSettingsForBroadcast(wheelForm.current.getValues()));

      const { unsubscribe } = wheelForm.current.watch((values) => {
        broadcastSettings.call(parseSettingsForBroadcast(values as Partial<Wheel.Settings>));
      });

      return () => unsubscribe();
    }
  }, [wheelForm, broadcastSettings, isBroadcastEnabled, parseSettingsForBroadcast]);

  const handleSpinStart = useCallback(
    (params: SpinParams) => {
      broadcastSpin(params.distance ?? 0, params.duration ?? 0, params.winner?.toString() ?? '');
    },
    [broadcastSpin],
  );

  return (
    <PageContainer className='wheel-wrapper padding' title={title}>
      <RandomWheel
        items={wheelItems}
        deleteItem={deleteItem}
        wheelRef={wheelController}
        onWheelItemsChanged={broadcastParticipantsChanged}
        form={wheelForm}
        onSpinStart={handleSpinStart}
      />
    </PageContainer>
  );
};

export default WheelPage;
