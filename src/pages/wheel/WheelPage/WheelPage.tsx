import { FC, Key, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import { RootState } from '@reducers';
import { WheelItem } from '@models/wheel.model';
import RandomWheel from '@components/RandomWheel/RandomWheel';
import { deleteSlot } from '@reducers/Slots/Slots';
import { getTotalSize, slotToWheel } from '@utils/slots.utils';
import aukusApi from '@api/events/aukusApi.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { useIsAukusActive } from '@hooks/aukus.ts';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const isAukusActive = useIsAukusActive();
  const dispath = useDispatch();

  const wheelItems = useMemo(() => slots.map<WheelItem>(slotToWheel), [slots]);

  const deleteItem = (id: Key) => {
    dispatch(deleteSlot(id.toString()));
  };

  const saveAukusResult = async ({ name, amount }: WheelItem) => {
    try {
      await aukusApi.updateResult({
        winner_title: name,
        auc_value: getTotalSize(slots),
        winner_value: amount,
        lots_count: slots.length,
      });
      dispath(addAlert({ message: 'Результат сохранен в Аукус', type: AlertTypeEnum.Success }));
    } catch (e: any) {
      dispath(addAlert({ message: `Ошибка сохранения - ${e.message}`, type: AlertTypeEnum.Error }));
    }
  };

  const handleSpinEnd = async (winner: WheelItem) => {
    if (isAukusActive) {
      await saveAukusResult(winner);
    }
  };

  return (
    <PageContainer className='wheel-wrapper padding' title={t('wheel.wheel')}>
      {/*{aukus.enabled && (*/}
      {/*  <AukusBackdrop winner={lastWinner?.name || ''} open={!!lastWinner} onClose={() => setLastWinner(null)} />*/}
      {/*)}*/}
      <RandomWheel items={wheelItems} deleteItem={deleteItem} onWin={handleSpinEnd} />
    </PageContainer>
  );
};

export default WheelPage;
