import { FC, Key, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';
import { RootState } from '@reducers';
import { WheelItem } from '@models/wheel.model';
import RandomWheel from '@components/RandomWheel/RandomWheel';
import { deleteSlot } from '@reducers/Slots/Slots';
import { slotToWheel } from '@utils/slots.utils';
import AukusBackdrop from '@components/RandomWheel/AukusBackdrop';
import withLoading from '@decorators/withLoading.ts';
import aukusApi from '@api/events/aukusApi.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';

const useIsAukusActive = () => {
  const { enabled } = useSelector((rootReducer: RootState) => rootReducer.aucSettings.settings.events.aukus);
  const { isValid } = useSelector((rootReducer: RootState) => rootReducer.user.events.aukus);

  return enabled && isValid;
};

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

  const saveAukusResult = async (value: string) => {
    // withLoading(setLoading, async () => {
    try {
      await aukusApi.updateResult({ winner_title: value });
      dispath(addAlert({ message: 'Результат сохранен в Аукус', type: AlertTypeEnum.Success }));
    } catch (e: any) {
      dispath(addAlert({ message: `Ошибка сохранения - ${e.message}`, type: AlertTypeEnum.Error }));
    } finally {
      // onClose();
    }
    // })();
  };

  const handleSpinEnd = async (winner: WheelItem) => {
    if (isAukusActive) {
      await saveAukusResult(winner.name);
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
