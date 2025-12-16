import { Button, Checkbox, Modal } from '@mantine/core';
import { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { archivedLotsToSlots } from '@domains/auction/archive/lib/converters';
import { ArchiveData } from '@domains/auction/archive/model/types';
import ImportForm from '@domains/auction/archive/ui/ImportForm';
import { Slot } from '@models/slot.model.ts';

interface SlotsPresetInputProps {
  buttonTitle: string;
  onChange: (items: Slot[], saveSlots: boolean) => void;
  buttonClass?: string;
  dialogTitle?: ReactNode;
  hint?: ReactNode;
}

const SlotsPresetInput: FC<SlotsPresetInputProps> = ({ onChange, buttonTitle, buttonClass, dialogTitle, hint }) => {
  const { t } = useTranslation();
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const [saveSlots, setSaveSlots] = useState<boolean>(false);
  const toggleDialog = (): void => {
    setIsInputOpened((prevOpened) => !prevOpened);
  };

  const closeDialog = (): void => {
    setIsInputOpened(false);
  };

  const handleSaveSlotsChange = (event: any): void => {
    setSaveSlots(event.target.checked);
  };

  const submit = (data: ArchiveData) => {
    onChange(archivedLotsToSlots(data.lots), saveSlots);
    closeDialog();
  };

  return (
    <div>
      <Modal
        opened={isInputOpened}
        onClose={toggleDialog}
        size='xxl'
        centered
        title={dialogTitle ?? t('wheel.import.title')}
      >
        <ImportForm
          onImport={submit}
          layout='horizontal'
          extraControls={
            <Checkbox checked={saveSlots} onChange={handleSaveSlotsChange} label={t('wheel.addLotsToAuc')} />
          }
        />
      </Modal>
      <Button variant='outline' onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default SlotsPresetInput;
