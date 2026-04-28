import { Socket, io } from 'socket.io-client';
import { ThunkAction } from '@reduxjs/toolkit';
import { Action } from '@reduxjs/toolkit';

import { getSocketIOUrl } from '@utils/url.utils';
import { RootState } from '@reducers/index';
import { buildSocketIoOptions } from '@shared/lib/socketIo';

import { setSocket, updateDataState } from '../model/store';
import { Broadcasting } from '../model/types';

let broadcastingSocket: Socket<Broadcasting.ListenEvents, Broadcasting.EmitEvents> | null = null;

const removeBroadcastingSocketListeners = (socket: Socket<Broadcasting.ListenEvents, Broadcasting.EmitEvents>): void => {
  socket.off('updatesRequested');
  socket.off('updatesSilenced');
  socket.off('connect');
  socket.off('disconnect');
};

export const connectToBroadcastingSocket: ThunkAction<void, RootState, {}, Action> = (dispatch, getState) => {
  if (broadcastingSocket) {
    if (broadcastingSocket.connected) {
      dispatch(setSocket(broadcastingSocket));
    }

    return;
  }

  const socket = io(
    `${getSocketIOUrl()}/broadcasting`,
    buildSocketIoOptions('default', {
      query: { cookie: document.cookie },
    }),
  ) as Socket<Broadcasting.ListenEvents, Broadcasting.EmitEvents>;
  broadcastingSocket = socket;

  socket.on('updatesRequested', (data) => {
    dispatch(updateDataState({ dataType: data.dataType, value: true }));
  });
  socket.on('updatesSilenced', (data) => {
    dispatch(updateDataState({ dataType: data.dataType, value: false }));
  });
  socket.on('connect', () => {
    dispatch(setSocket(socket));
  });
  socket.on('disconnect', () => {
    dispatch(setSocket(null));
  });
};

export const disconnectBroadcastingSocket: ThunkAction<void, RootState, {}, Action> = (dispatch) => {
  if (!broadcastingSocket) return;

  removeBroadcastingSocketListeners(broadcastingSocket);
  broadcastingSocket.disconnect();
  broadcastingSocket = null;
  dispatch(setSocket(null));
};
