import React, { FC } from 'react';
import { AudioPreset } from '../../../api/audioRoomApi';
import Preset from '../Preset/Preset';

interface PresetsListrPops {
  presets: AudioPreset[];
  deletePreset: (id: string) => void;
  playPreset: (id: string) => void;
}

const PresetsList: FC<PresetsListrPops> = ({ presets, deletePreset, playPreset }) => {
  return (
    <div className="box-container">
      <div className="presets-list">
        {presets.map((preset) => (
          <Preset key={preset._id} data={preset} deletePreset={deletePreset} playPreset={playPreset} />
        ))}
      </div>
    </div>
  );
};

export default PresetsList;
