import React, { FC, ReactEventHandler, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { DropzoneArea } from 'material-ui-dropzone';
import { FilledInputProps } from '@material-ui/core/FilledInput';
import { useDispatch } from 'react-redux';
import audioRoomApi, { AudioPreset } from '../../../api/audioRoomApi';
import { addAlert } from '../../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../../models/alert.model';
import LoadingButton from '../../LoadingButton/LoadingButton';

interface AddPresetButtonProps {
  addPreset: (preset: AudioPreset) => void;
}

const AddPresetButton: FC<AddPresetButtonProps> = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<File>();
  const [presetName, setPresetName] = useState<string>();
  const [volume, setVolume] = useState<number>(1);

  const audioUrl = useMemo(() => audioFile && URL.createObjectURL(audioFile), [audioFile]);

  const resetFields = () => {
    setAudioFile(undefined);
    setPresetName(undefined);
    setVolume(1);
  };

  const toggleFormOpen = () => {
    setFormOpen((prevOpen) => !prevOpen);
    resetFields();
  };

  const handleFileUpload = ([file]: File[]): void => {
    setAudioFile(file);

    if (!presetName) {
      setPresetName(file.name);
    }
  };

  const handleNameChange: FilledInputProps['onChange'] = (e): void => {
    setPresetName(e.target.value);
  };

  const handleVolumeChange: ReactEventHandler<HTMLAudioElement> = (e): void => {
    setVolume((e.target as any).volume);
  };

  const handleSubmit = async () => {
    try {
      if (audioFile && presetName) {
        // const file = await audioFile.arrayBuffer();
        // console.log(file);
        setIsLoading(true);
        await audioRoomApi.postPreset({ name: presetName, file: audioFile, volume });

        toggleFormOpen();
      } else {
        dispatch(addAlert({ type: AlertTypeEnum.Error, message: 'заполните все поля!' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button startIcon={<AddIcon />} size="large" variant="outlined" onClick={toggleFormOpen}>
        <Typography>Новое аудио</Typography>
      </Button>
      <Dialog open={formOpen} onClose={toggleFormOpen} maxWidth="md">
        <DialogContent className="image-input-wrapper">
          <div className="row-ap" style={{ marginBottom: 20, width: '100%' }}>
            <Typography style={{ margin: '0 15px 0 0' }} variant="h5">
              Название
            </Typography>
            <OutlinedInput margin="dense" style={{ flexGrow: 1 }} value={presetName} onChange={handleNameChange} />
          </div>
          <DropzoneArea
            dropzoneClass="drop-zone"
            dropzoneText="Перетащите сюда файл или нажмите"
            onDrop={handleFileUpload}
            showPreviewsInDropzone={false}
            maxFileSize={5 * 2 ** 20}
            acceptedFiles={['.mp3']}
          />
          {audioFile && (
            <div>
              <div className="row-ap" style={{ width: '100%', marginTop: 20 }}>
                <Typography style={{ margin: '0 15px 0 0' }} variant="h5">
                  Превью:
                </Typography>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={audioUrl} onVolumeChange={handleVolumeChange}>
                  not supported audio
                </audio>
              </div>
              <Typography style={{ color: '#f1f1f1', marginTop: 10 }}>
                Настройте громкость, с такой же громкостью запись будет воспроизводиться на сайте.
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <LoadingButton isLoading={isLoading} variant="contained" color="primary" onClick={handleSubmit}>
            создать
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPresetButton;
