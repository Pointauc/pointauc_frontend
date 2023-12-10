import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { DropzoneArea } from 'react-mui-dropzone';
import { useTranslation } from 'react-i18next';
import './ImageLinkInput.scss';

interface ImageLinkInputProps {
  buttonTitle: string;
  onChange: (imageLink: string) => void;
  dialogTitle?: string;
  buttonClass?: string;
}

const ImageLinkInput: React.FC<ImageLinkInputProps> = ({ buttonTitle, dialogTitle, buttonClass, onChange }) => {
  const { t } = useTranslation();
  const [isInputOpened, setIsInputOpened] = useState<boolean>(false);
  const [isCorrectUrl, setIsCorrectUrl] = useState(true);
  const toggleDialog = (): void => {
    setIsCorrectUrl(true);
    setIsInputOpened((prevOpened) => !prevOpened);
  };

  const isImage = (url: string): Promise<Event> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = resolve;
      image.onerror = reject;
    });

  const handleLinkPaste = (e: any): void => {
    const imageUrl = e.clipboardData.getData('text');
    setTimeout(() => {
      isImage(imageUrl)
        .then(() => {
          onChange(imageUrl);
          setIsInputOpened(false);
        })
        .catch(() => setIsCorrectUrl(false));
    }, 170);
  };

  const handleFileUpload = ([file]: File[]): void => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        setIsInputOpened(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Dialog open={isInputOpened} onClose={toggleDialog} maxWidth={false}>
        {!!dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
        <DialogContent className='image-input-wrapper'>
          <DropzoneArea
            dropzoneClass='drop-zone'
            dropzoneText={t('common.moveFileOrClick')}
            onDrop={handleFileUpload}
            filesLimit={1}
            maxFileSize={1000 * 1000 * 50}
          />
          <Typography className='divider'>{t('common.or')}</Typography>
          <TextField
            onPaste={handleLinkPaste}
            placeholder={t('common.insertImageLink')}
            className='link-input'
            error={!isCorrectUrl}
            helperText={!isCorrectUrl ? t('common.incorrectLink') : undefined}
            variant='outlined'
          />
        </DialogContent>
      </Dialog>
      <Button variant='outlined' color='primary' onClick={toggleDialog} className={buttonClass}>
        {buttonTitle}
      </Button>
    </>
  );
};

export default ImageLinkInput;
