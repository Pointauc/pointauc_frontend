import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { CamilleList, RequestsListInfo, UserRequest } from '../../models/requests.model';
import { RootState } from '../index';
import { getCamilleBotData } from '../../api/requestsApi';
import { addAlert } from '../notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import { KeyListenersClient } from '../../services/ChatService';
import { addSlot, deleteSlot, setSlotName } from '../Slots/Slots';
import { getSlot } from '../../utils/slots.utils';

interface RequestsState {
  lists: RequestsListInfo[];
  currentList: string;
  isLoading: boolean;
  chatClient: KeyListenersClient | null;
}

type ListData<T> = { listId?: string; data: T };
type ListAction<T> = PayloadAction<ListData<T>>;

const CamilleBotLists: RequestsListInfo[] = [
  {
    name: 'Игры сабов (Camille_Bot)',
    uuid: CamilleList.Games,
    disabled: true,
    allData: [],
    winnersData: [],
    isSyncWithAuc: false,
  },
  {
    name: 'Фильмы сабов (Camille_Bot)',
    uuid: CamilleList.Movies,
    disabled: true,
    allData: [],
    winnersData: [],
    isSyncWithAuc: false,
  },
];

const initialState: RequestsState = {
  lists: CamilleBotLists,
  currentList: CamilleBotLists[0].uuid,
  isLoading: false,
  chatClient: null,
};

const getListIndex = (state: RequestsState, id: string): number => state.lists.findIndex(({ uuid }) => uuid === id);
export const getList = (lists: RequestsListInfo[], id: string): RequestsListInfo =>
  lists.find(({ uuid }) => uuid === id) as RequestsListInfo;

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    initChatClient(state, { payload }: PayloadAction<string>): void {
      state.chatClient = new KeyListenersClient(payload);
    },
    setIsLoading(state, { payload }: PayloadAction<boolean>): void {
      state.isLoading = payload;
    },
    setCurrentList(state, { payload }: PayloadAction<string>): void {
      state.currentList = payload;
    },
    addRequestsList(state, action: PayloadAction<RequestsListInfo>): void {
      state.lists = [...state.lists, action.payload];
    },
    deleteRequestsList(state, action: PayloadAction<string>): void {
      state.lists = state.lists.filter(({ uuid }) => action.payload !== uuid);
    },
    updateRequestsList(
      state: RequestsState,
      action: PayloadAction<{ id: string; data: Partial<RequestsListInfo> }>,
    ): void {
      const { data, id } = action.payload;
      state.lists = state.lists.map((request) => (id === request.uuid ? { ...request, ...data } : request));
    },
    addRequest(state, { payload: { listId = state.currentList, data } }: ListAction<UserRequest>): void {
      const index = getListIndex(state, listId);
      const dataIndex = state.lists[index].allData.findIndex(({ id }) => id === data.id);

      if (dataIndex === -1) {
        state.lists[index].allData = [...state.lists[index].allData, data];
      } else {
        const arr = [...state.lists[index].allData];

        arr[dataIndex] = data;
        state.lists[index].allData = arr;
      }
    },
    // deleteRequest(state, { payload: { listId = state.currentList, data } }: ListAction<string>): void {
    //   const index = getListIndex(state, listId);
    //   state.lists[index].allData = state.lists[index].allData.filter(({ id }) => data !== id);
    // },
    setAllData(state, { payload: { listId = state.currentList, data } }: ListAction<UserRequest[]>): void {
      state.lists[getListIndex(state, listId)].allData = data;
    },
    addRequestWinner(state, { payload: { listId = state.currentList, data } }: ListAction<UserRequest>): void {
      const index = getListIndex(state, listId);
      state.lists[index].winnersData = [...state.lists[index].winnersData, data];
    },
    deleteRequestWinner(state, { payload: { listId = state.currentList, data } }: ListAction<string>): void {
      const index = getListIndex(state, listId);
      state.lists[index].winnersData = state.lists[index].winnersData.filter(({ id }) => data !== id);
    },
    setWinnersData(state, { payload: { listId = state.currentList, data } }: ListAction<UserRequest[]>): void {
      state.lists[getListIndex(state, listId)].winnersData = data;
    },
    setSyncState(state, { payload: { listId = state.currentList, data } }: ListAction<boolean>): void {
      state.lists[getListIndex(state, listId)].isSyncWithAuc = data;
    },
  },
});

export const {
  addRequestsList,
  deleteRequestsList,
  addRequestWinner,
  deleteRequestWinner,
  setCurrentList,
  setWinnersData,
  setAllData,
  updateRequestsList,
  setIsLoading,
  initChatClient,
  setSyncState,
} = requestsSlice.actions;

export const updateFromCamilleBot =
  (username: string, listKey: CamilleList) =>
  async (dispatch: ThunkDispatch<RootState, {}, Action>): Promise<void> => {
    dispatch(setIsLoading(true));
    const data = await getCamilleBotData(username, listKey);

    if (data === 'You are not registred in camille-bot.') {
      dispatch(addAlert({ duration: 5000, message: data, type: AlertTypeEnum.Error }));
      dispatch(setIsLoading(false));
      return;
    }

    const listData = Object.entries(data).map<UserRequest>(([login, request]) => ({
      id: login,
      request,
      username: login,
    }));

    dispatch(setAllData({ data: listData }));
    dispatch(setIsLoading(false));
  };

export const addRequest =
  ({ listId, data }: ListData<UserRequest>): any =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const state = getState();
    const index = getListIndex(state.requests, listId || state.requests.currentList);
    const { allData, isSyncWithAuc } = state.requests.lists[index];
    const dataIndex = allData.findIndex(({ id }) => id === data.id);
    const { id, request, username } = data;
    const name = `${username}: ${request}`;

    if (dataIndex === -1) {
      dispatch(setAllData({ listId, data: [...allData, data] }));

      if (isSyncWithAuc) {
        dispatch(addSlot({ id, amount: 1, name }));
      }
    } else {
      const arr = [...allData];

      arr[dataIndex] = data;
      dispatch(setAllData({ listId, data: arr }));
      const { slots } = state.slots;
      const slot = getSlot(slots, id);

      if (isSyncWithAuc && slot?.amount === 1) {
        dispatch(setSlotName({ id, name }));
      }
    }
  };

export const deleteRequest =
  ({ listId, data }: ListData<string>): any =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const state = getState();
    const index = getListIndex(state.requests, listId || state.requests.currentList);
    const { allData, isSyncWithAuc } = state.requests.lists[index];
    dispatch(setAllData({ listId, data: allData.filter(({ id }) => data !== id) }));

    if (isSyncWithAuc) {
      dispatch(deleteSlot(data));
    }
  };

export const syncWithAuc =
  (listId?: string): any =>
  (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): void => {
    const state = getState();
    const index = getListIndex(state.requests, listId || state.requests.currentList);
    const { slots } = state.slots;
    const { allData } = state.requests.lists[index];

    allData.forEach(({ id, request, username }) => {
      const slot = getSlot(slots, id);
      const name = `${username}: ${request}`;

      if (!slot) {
        dispatch(addSlot({ id, amount: 1, name }));
      } else if (slot.name !== name && slot.amount === 1) {
        dispatch(setSlotName({ id, name }));
      }
    });

    dispatch(setSyncState({ listId, data: true }));
  };

export default requestsSlice.reducer;
