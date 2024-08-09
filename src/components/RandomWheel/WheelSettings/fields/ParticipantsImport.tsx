import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput.tsx';
import { Slot } from '@models/slot.model.ts';
import { slotToWheel } from '@utils/slots.utils.ts';
import { setSlots } from '@reducers/Slots/Slots.ts';
import { WheelContext } from '@components/RandomWheel/WheelSettings/WheelContext.tsx';

const ParticipantsImportField = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { changeInitialItems } = useContext(WheelContext);
  const handleCustomWheel = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      changeInitialItems(customItems.map(slotToWheel) as any);

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
