import { backendApi } from '@api/backendApi';

import ENDPOINTS from '../constants/api.constants';

export interface AudioRoomUser {
  username: string;
  password: string;
}

export interface AudioPresetCommon {
  name: string;
  volume: number;
}

export interface AudioPreset extends AudioPresetCommon {
  url: string;
  _id: string;
}

export interface AudioPresetPostData extends AudioPresetCommon {
  file: File;
}

class AudioRoomApi {
  getUser = async (): Promise<AudioRoomUser> => {
    const { data } = await backendApi.get<AudioRoomUser>(ENDPOINTS.AUDIO_ROOM.USER);

    return data;
  };

  login = async (user: AudioRoomUser): Promise<void> => {
    await backendApi.post(ENDPOINTS.AUDIO_ROOM.USER, user);
  };

  getPresets = async (): Promise<AudioPreset[]> => {
    const { data } = await backendApi.get<AudioPreset[]>(ENDPOINTS.AUDIO_ROOM.PRESETS);

    return data;
  };

  postPreset = async ({ file, volume, name }: AudioPresetPostData): Promise<AudioPreset> => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('volume', volume.toString());
    formData.append('name', name);

    const { data } = await backendApi.post(ENDPOINTS.AUDIO_ROOM.PRESETS, formData);

    return data;
  };

  deletePreset = async (id: string): Promise<void> => {
    await backendApi.delete(ENDPOINTS.AUDIO_ROOM.PRESETS, { params: { id } });
  };
}

export default new AudioRoomApi();
