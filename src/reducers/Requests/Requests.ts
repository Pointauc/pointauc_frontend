import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { CamilleList, Request, RequestsListInfo } from '../../models/requests.model';
import { RootState } from '../index';
import { getCamilleBotData } from '../../api/requestsApi';

interface RequestsState {
  lists: RequestsListInfo[];
  winnersListData: Request[];
  currentListData: Request[];
}

const CamilleBotLists: RequestsListInfo[] = [
  { name: 'Игры сабов (Camille_Bot)', uuid: CamilleList.Games, disabled: true },
  { name: 'Фильмы сабов (Camille_Bot)', uuid: CamilleList.Movies, disabled: true },
];

const initialState: RequestsState = {
  lists: CamilleBotLists,
  winnersListData: [],
  currentListData: [],
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    addRequestsList(state, action: PayloadAction<RequestsListInfo>): void {
      state.lists = [...state.lists, action.payload];
    },
    deleteRequestsList(state, action: PayloadAction<string>): void {
      state.lists = state.lists.filter(({ uuid }) => action.payload !== uuid);
    },
    addRequest(state, action: PayloadAction<Request>): void {
      state.currentListData = [...state.currentListData, action.payload];
    },
    deleteRequest(state, action: PayloadAction<string>): void {
      state.currentListData = state.currentListData.filter(({ id }) => action.payload !== id);
    },
    setCurrentList(state, action: PayloadAction<Request[]>): void {
      state.currentListData = action.payload;
    },
    addRequestWinner(state, action: PayloadAction<Request>): void {
      state.winnersListData = [...state.winnersListData, action.payload];
    },
    deleteRequestWinner(state, action: PayloadAction<string>): void {
      state.winnersListData = state.winnersListData.filter(({ id }) => action.payload !== id);
    },
  },
});

export const {
  addRequestsList,
  deleteRequestsList,
  addRequest,
  deleteRequest,
  addRequestWinner,
  deleteRequestWinner,
  setCurrentList,
} = requestsSlice.actions;

export const updateFromCamilleBot =
  (username: string, listKey: CamilleList) =>
  (dispatch: ThunkDispatch<RootState, {}, Action>): void => {
    const data = getCamilleBotData(username, listKey);
    const listData = Object.entries(data).map<Request>(([login, request]) => ({ id: login, request, username: login }));

    dispatch(setCurrentList(listData));
  };

export default requestsSlice.reducer;
