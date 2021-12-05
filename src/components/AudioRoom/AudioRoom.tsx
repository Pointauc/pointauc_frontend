import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import audioRoomApi, { AudioPreset, AudioRoomUser } from '../../api/audioRoomApi';
import RoomLoginPage from './RoomLoginPage/RoomLoginPage';
import { useAudioPageStyles } from '../../constants/theme.constants';
import AddPresetButton from './AddPresetButton/AddPresetButton';
import PresetsList from './PresetsList/PresetsList';
import ConnectedUsers from './ActiveUsers/ConnectedUsers';
import './AudioRoom.scss';
import AlertsContainer from '../AlertsContainer/AlertsContainer';
import { getSocketIOUrl } from '../../utils/url.utils';

const AudioRoom = () => {
  const classes = useAudioPageStyles();
  const [user, setUser] = useState<AudioRoomUser>();
  const [presets, setPresets] = useState<AudioPreset[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket>();

  const addPreset = (preset: AudioPreset) => {
    setPresets((prevState) => [...prevState, preset]);
  };

  const deletePreset = (id: string) => {
    setPresets((prevState) => prevState.filter(({ _id }) => _id !== id));
  };

  const emitPreset = (id: string) => {
    socket?.emit('play', id);
  };

  const updatePresets = async () => {
    const newPresets = await audioRoomApi.getPresets();
    setPresets(newPresets);
  };

  useEffect(() => {
    if (user) {
      updatePresets();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const _socket = io(getSocketIOUrl(), { query: { username: user.username, password: user.password } });

      _socket.on('connect', () => {
        console.log('connected');
      });

      _socket.on('play', (id) => {
        setPresets((currentPresets) => {
          const preset = currentPresets.find(({ _id }) => id === _id);

          if (preset) {
            const { url, volume } = preset;

            const audio = new Audio(url);

            audio.volume = volume;

            audio.play();
          }

          return currentPresets;
        });
      });

      _socket.on('usersJoin', (usernames) => {
        setConnectedUsers((prevState) => [...prevState, ...usernames]);
      });
      _socket.on('userLeave', (username) =>
        setConnectedUsers((prevState) => prevState.filter((_username) => _username !== username)),
      );
      _socket.on('addPreset', addPreset);
      _socket.on('deletePreset', deletePreset);

      _socket.connect();

      setSocket(_socket);

      return () => {
        _socket.disconnect();
      };
    }

    return () => ({});
  }, [user]);

  if (!user) {
    return <RoomLoginPage setUser={setUser} />;
  }

  return (
    <div className={classes.root}>
      <AlertsContainer />
      <div className="row-ap">
        <div className="col-ap">
          <AddPresetButton addPreset={addPreset} />
          <PresetsList presets={presets} deletePreset={deletePreset} playPreset={emitPreset} />
        </div>
        <div className="col-ap">
          <ConnectedUsers users={connectedUsers} />
        </div>
      </div>
    </div>
  );
};

export default AudioRoom;
