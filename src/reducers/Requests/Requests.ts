import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { CamilleList, RequestsListInfo, UserRequest } from '../../models/requests.model';
import { RootState } from '../index';
import { getCamilleBotData } from '../../api/requestsApi';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';

interface RequestsState {
  lists: RequestsListInfo[];
  winnersListData: UserRequest[];
  currentListData: UserRequest[] | undefined;
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
    updateRequestsList(state: RequestsState, action: PayloadAction<{ id: string; data: RequestsListInfo }>): void {
      const { data, id } = action.payload;
      state.lists = state.lists.map((request) => (id === request.uuid ? data : { ...data, ...request }));
    },
    addRequest(state, action: PayloadAction<UserRequest>): void {
      if (!state.currentListData) {
        state.currentListData = [action.payload];
      }

      const dataIndex = state.currentListData.findIndex(({ id }) => id === action.payload.id);

      if (dataIndex === -1) {
        state.currentListData = [...state.currentListData, action.payload];
      } else {
        const arr = [...state.currentListData];

        arr[dataIndex] = action.payload;
        state.currentListData = arr;
      }
    },
    deleteRequest(state, action: PayloadAction<string>): void {
      state.currentListData = state.currentListData && state.currentListData.filter(({ id }) => action.payload !== id);
    },
    setCurrentList(state, action: PayloadAction<UserRequest[] | undefined>): void {
      state.currentListData = action.payload;
    },
    addRequestWinner(state, action: PayloadAction<UserRequest>): void {
      state.winnersListData = [...state.winnersListData, action.payload];
    },
    deleteRequestWinner(state, action: PayloadAction<string>): void {
      state.winnersListData = state.winnersListData.filter(({ id }) => action.payload !== id);
    },
    setWinnersList(state, action: PayloadAction<UserRequest[]>): void {
      state.winnersListData = action.payload;
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
  setWinnersList,
  updateRequestsList,
} = requestsSlice.actions;

export const updateFromCamilleBot =
  (username: string, listKey: CamilleList) =>
  async (dispatch: ThunkDispatch<RootState, {}, Action>): Promise<void> => {
    dispatch(setCurrentList(undefined));
    const data = await getCamilleBotData(username, listKey);

    if (data === 'You are not registred in camille-bot.') {
      dispatch(addAlert({ duration: 5000, message: data, type: AlertTypeEnum.Error }));
      dispatch(setCurrentList([]));
      return;
    }

    const listData = Object.entries(data).map<UserRequest>(([login, request]) => ({
      id: login,
      request,
      username: login,
    }));

    dispatch(setCurrentList(listData));
  };

export default requestsSlice.reducer;
