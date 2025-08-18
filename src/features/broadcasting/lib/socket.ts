import { Socket, io } from 'socket.io-client';
import { ThunkAction } from '@reduxjs/toolkit';
import { Action } from '@reduxjs/toolkit';

import { getSocketIOUrl } from '@utils/url.utils';
import { RootState } from '@reducers/index';

import { setSocket, updateDataState } from '../model/store';
import { Broadcasting } from '../model/types';

export const connectToBroadcastingSocket: ThunkAction<void, RootState, {}, Action> = (dispatch, getState) => {
  const socket = io(`${getSocketIOUrl()}/broadcasting`, { query: { cookie: document.cookie } }) as Socket<
    Broadcasting.ListenEvents,
    Broadcasting.EmitEvents
  >;
  socket.on('updatesRequested', (data) => {
    console.log('updatesRequested', data);
    dispatch(updateDataState({ dataType: data.dataType, value: true }));
  });

  socket.on('updatesSilenced', (data) => {
    console.log('updatesSilenced', data);
    dispatch(updateDataState({ dataType: data.dataType, value: false }));
  });

  socket.on('connect', () => {
    dispatch(setSocket(socket));
  });

  socket.on('disconnect', () => {
    dispatch(setSocket(null));
  });
};
