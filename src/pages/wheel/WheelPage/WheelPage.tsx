import { Group } from '@mantine/core';
import { FC, Key, useCallback, useMemo, useRef } from 'react';
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

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelController = useRef<RandomWheelController | null>(null);

  const wheelItems = useMemo(() => slots.map<WheelItem>(slotToWheel), [slots]);

  const setCustomWheelItems = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      wheelController.current?.setItems(customItems.map(slotToWheel) as any);
      console.log(customItems.map(slotToWheel), wheelController.current);

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
      <RandomWheel items={wheelItems} deleteItem={deleteItem} wheelRef={wheelController} />
    </PageContainer>
  );
};

export default WheelPage;
