import React, { FC } from 'react';
import { Button, IconButton, Typography } from '@material-ui/core';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import audioRoomApi, { AudioPreset } from '../../../api/audioRoomApi';

interface PresetProps {
  data: AudioPreset;
  deletePreset: (id: string) => void;
  playPreset: (id: string) => void;
}

const Preset: FC<PresetProps> = ({ data, playPreset }) => {
  const { name, _id } = data;

  const playAudio = () => {
    playPreset(_id);
  };

  const handleClickDelete = () => {
    audioRoomApi.deletePreset(_id);
  };

  return (
    <div className="box-container row-ap preset">
      <div className="col-ap" style={{ marginRight: 15 }}>
        <Typography style={{ marginBottom: 5 }}>{name}</Typography>
        <Button onClick={handleClickDelete} size="small" variant="outlined" color="secondary">
          удалить
        </Button>
      </div>
      <IconButton onClick={playAudio} title="проиграть">
        <PlayCircleFilledIcon fontSize="large" />
      </IconButton>
    </div>
  );
};

export default Preset;
