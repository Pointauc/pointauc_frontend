import React, { FC, ReactNode, useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { DropzoneArea } from 'material-ui-dropzone';
import { parseWheelPreset } from '../../../utils/slots.utils';
import './SlotsPresetInput.scss';
import { WheelItem } from '../../../models/wheel.model';

interface SlotsPresetInput {
  buttonTitle: string;
  onChange: (items: WheelItem[]) => void;
  buttonClass?: string;
  dialogTitle?: ReactNode;
  hint?: ReactNode;
}

const SlotsPresetInput: FC<SlotsPresetInput> = ({ onChange, buttonTitle, buttonClass, dialogTitle, hint }) => {
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const toggleDialog = (): void => {
    setIsInputOpened((prevOpened) => !prevOpened);
  };

  const handleFileUpload = ([file]: File[]): void => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        onChange(parseWheelPreset(reader.result));
        setIsInputOpened(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="slots-preset-input">
      <Dialog open={isInputOpened} onClose={toggleDialog} maxWidth={false}>
        {!!dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
        <DialogContent className="image-input-wrapper">
          <DropzoneArea
            dropzoneClass="drop-zone"
            dropzoneText="Перетащите сюда файл или нажмите"
            onDrop={handleFileUpload}
            filesLimit={1}
          />
          {hint && <div className="slots-preset-input-hint">{hint}</div>}
        </DialogContent>
      </Dialog>
      <Button variant="outlined" color="primary" onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default SlotsPresetInput;
