import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, OutlinedInput } from '@material-ui/core';
import { DropzoneArea } from 'material-ui-dropzone';
import './ImageLinkInput.scss';

interface ImageLinkInputProps {
  buttonTitle: string;
  onChange: (imageLink: string) => void;
  dialogTitle?: string;
  buttonClass?: string;
}

const ImageLinkInput: React.FC<ImageLinkInputProps> = ({ buttonTitle, dialogTitle, buttonClass, onChange }) => {
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const toggleDialog = (): void => setIsInputOpened((prevOpened) => !prevOpened);

  const handleLinkPaste = (e: any): void => {
    const imageLink = e.clipboardData.getData('text');
    setTimeout(() => {
      onChange(imageLink);
      setIsInputOpened(false);
    }, 250);
  };

  return (
    <div>
      <Dialog open={isInputOpened} onClose={toggleDialog} maxWidth={false}>
        {!!dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
        <DialogContent className="image-input-wrapper">
          <DropzoneArea
            dropzoneClass="drop-zone"
            dropzoneText="Перетащите сюда файл или нажмите"
            dropzoneProps={{ disabled: true }}
          />
          <div className="divider">ИЛИ</div>
          <OutlinedInput
            onPaste={handleLinkPaste}
            placeholder="Вставьте ссылку на изображение..."
            className="link-input"
          />
        </DialogContent>
      </Dialog>
      <Button variant="outlined" color="primary" onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default ImageLinkInput;
