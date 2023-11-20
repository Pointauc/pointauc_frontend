import { FC, ReactNode, useState } from 'react';
import { Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { DropzoneArea } from 'react-mui-dropzone';
import { useTranslation } from 'react-i18next';

import { parseSlotsPreset } from '@utils/slots.utils.ts';
import { Slot } from '@models/slot.model.ts';

import './SlotsPresetInput.scss';

interface SlotsPresetInput {
  buttonTitle: string;
  onChange: (items: Slot[], saveSlots: boolean) => void;
  buttonClass?: string;
  dialogTitle?: ReactNode;
  hint?: ReactNode;
}

const SlotsPresetInput: FC<SlotsPresetInput> = ({ onChange, buttonTitle, buttonClass, dialogTitle, hint }) => {
  const { t } = useTranslation();
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const [saveSlots, setSaveSlots] = useState<boolean>(false);
  const toggleDialog = (): void => {
    setIsInputOpened((prevOpened) => !prevOpened);
  };

  const handleFileUpload = ([file]: File[]): void => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        onChange(parseSlotsPreset(reader.result), saveSlots);
        setIsInputOpened(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSlotsChange = (event: any): void => {
    setSaveSlots(event.target.checked);
  };

  return (
    <div className='slots-preset-input'>
      <Dialog open={isInputOpened} onClose={toggleDialog} maxWidth={false}>
        {!!dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
        <DialogContent className='image-input-wrapper'>
          <DropzoneArea
            dropzoneClass='drop-zone'
            dropzoneText={t('common.moveFileOrClick')}
            onDrop={handleFileUpload}
            filesLimit={1}
          />
          <FormControlLabel
            className='save-slots-checkbox'
            control={<Checkbox checked={saveSlots} onChange={handleSaveSlotsChange} color='primary' />}
            label={t('wheel.addLotsToAuc')}
          />
          {hint && <div className='slots-preset-input-hint'>{hint}</div>}
        </DialogContent>
      </Dialog>
      <Button variant='outlined' color='primary' onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default SlotsPresetInput;
