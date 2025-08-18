import { Group } from '@mantine/core';
import { FC, Key, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import PageContainer from '@components/PageContainer/PageContainer';
import RandomWheel, { RandomWheelController } from '@components/RandomWheel/RandomWheel';
import { Slot } from '@models/slot.model';
import { WheelItem } from '@models/wheel.model';
import { RootState } from '@reducers';
import { deleteSlot, setSlots } from '@reducers/Slots/Slots';
import { slotToWheel } from '@utils/slots.utils';
import { useWheelBroadcasting } from '@features/broadcasting/lib/broadcastHooks/useWheelBroadcasting';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);
  const { broadcastParticipantsChanged, broadcastSpin } = useWheelBroadcasting();

  const wheelItems = useMemo(() => slots.map<WheelItem>(slotToWheel), [slots]);

  // Broadcast participants when they change
  useEffect(() => {
    broadcastParticipantsChanged(wheelItems);
  }, [wheelItems, broadcastParticipantsChanged]);

  const handleWheelWin = useCallback(
    (winner: WheelItem) => {
      // This callback is triggered when the wheel finishes spinning
      // The spin details (angle, duration) should be captured during the actual spin
      // For now, we'll broadcast the winner info
      // TODO: Enhance to capture actual spin angle and duration
      broadcastSpin(Math.random() * 360, 3000, winner.id.toString());
    },
    [broadcastSpin],
  );

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

  return (
    <PageContainer className='wheel-wrapper padding' title={title}>
      <RandomWheel items={wheelItems} deleteItem={deleteItem} wheelRef={wheelController} onWin={handleWheelWin} />
    </PageContainer>
  );
};

export default WheelPage;
