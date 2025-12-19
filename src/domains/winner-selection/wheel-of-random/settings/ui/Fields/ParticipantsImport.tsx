import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import { WheelContext } from '@domains/winner-selection/wheel-of-random/settings/ui/Context/WheelContext';
import { Slot } from '@models/slot.model.ts';
import { setSlots } from '@reducers/Slots/Slots.ts';
import { SlotListToWheelList } from '@utils/slots.utils.ts';

const ParticipantsImportField = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { changeInitialItems } = useContext(WheelContext);
  const handleCustomWheel = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      changeInitialItems(SlotListToWheelList(customItems));

      if (saveSlots) {
        dispatch(setSlots(customItems));
      }
    },
    [changeInitialItems, dispatch],
  );

  return (
    <SlotsPresetInput
      buttonTitle={t('wheel.importToWheel')}
      onChange={handleCustomWheel}
      hint={
        <>
          <div>* Принимается простой текстовый файл, где позиции лотов разделены новой строкой *</div>
          <br />
          <div>Новые лоты появятся в колесе, но не будут влиять на аукцион</div>
        </>
      }
    />
  );
};

export default ParticipantsImportField;
