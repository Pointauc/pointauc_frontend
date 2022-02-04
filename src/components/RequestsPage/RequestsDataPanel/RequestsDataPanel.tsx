import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, MenuItem, MuiThemeProvider, Select, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { ChatUserstate } from 'tmi.js';
import { RootState } from '../../../reducers';
import './RequestsDataPanel.scss';
import { successTheme } from '../../../constants/theme.constants';
import { CamilleList, RequestsListInfo } from '../../../models/requests.model';
import {
  addRequest,
  addRequestsList,
  getList,
  setCurrentList,
  updateFromCamilleBot,
  updateRequestsList,
} from '../../../reducers/Requests/Requests';
import ListSettingsDialog from './ListSettings/ListSettingsDialog';

const newListTemplate: RequestsListInfo = {
  uuid: v4(),
  name: 'Новый список',
  command: '!play',
  isSyncWithAuc: false,
  winnersData: [],
  allData: [],
};

const RequestsDataPanel: FC = () => {
  const dispatch = useDispatch();
  const { lists, currentList, chatClient } = useSelector((root: RootState) => root.requests);
  const { username: channelName } = useSelector((root: RootState) => root.user);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreationOpen, setIsCreationOpen] = useState<boolean>(false);

  const listInfo = useMemo(() => getList(lists, currentList), [currentList, lists]);
  const { command } = listInfo;

  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    setIsConnected(!!command && !!chatClient && chatClient.commandListeners.has(command));
  }, [chatClient, command, listInfo]);

  const settingsForm = useForm<RequestsListInfo>({ defaultValues: listInfo });
  const { reset } = settingsForm;

  useEffect(() => {
    reset(listInfo);
  }, [currentList, listInfo, reset]);

  const creationForm = useForm<RequestsListInfo>({ defaultValues: newListTemplate });

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prevOpen) => !prevOpen);
  }, []);

  const toggleCreationOpen = useCallback(() => {
    setIsCreationOpen((prevOpen) => !prevOpen);
  }, []);

  const updateSettings = useCallback(
    (data: RequestsListInfo) => {
      dispatch(updateRequestsList({ id: currentList, data }));
      toggleSettingsOpen();
    },
    [dispatch, currentList, toggleSettingsOpen],
  );

  const createList = useCallback(
    (data: RequestsListInfo) => {
      const uuid = v4();

      dispatch(addRequestsList({ ...newListTemplate, ...data, uuid }));
      dispatch(setCurrentList(uuid));
      toggleCreationOpen();
    },
    [dispatch, toggleCreationOpen],
  );

  const handleListChange = useCallback(
    (event: ChangeEvent<any>) => dispatch(setCurrentList(event.target.value)),
    [dispatch],
  );

  useEffect(() => {
    if (Object.values<any>(CamilleList).includes(currentList) && channelName) {
      dispatch(updateFromCamilleBot(channelName, currentList as CamilleList));
    }
  }, [dispatch, currentList, channelName]);

  const handleNewRequest = useCallback(
    ({ username: id = '', 'display-name': username = '', badges }: ChatUserstate, request?: string) => {
      if (!listInfo.subOnly || badges?.subscriber || badges?.founder) {
        dispatch(addRequest({ data: { username, id, request } }));
      }
    },
    [dispatch, listInfo.subOnly],
  );

  const handleConnect = useCallback(() => {
    chatClient?.listenCommand(listInfo.command || '', handleNewRequest);
    setIsConnected(true);
  }, [chatClient, handleNewRequest, listInfo.command]);

  const handleDisconnect = useCallback(() => {
    chatClient?.unListenCommand(listInfo.command || '');
    setIsConnected(false);
  }, [chatClient, listInfo.command]);

  return (
    <div className="requests-list-panel">
      <ListSettingsDialog
        form={settingsForm}
        onSubmit={updateSettings}
        open={isSettingsOpen}
        toggleOpen={toggleSettingsOpen}
        title="Настройки списка заказов"
        disabled
      />
      <ListSettingsDialog
        form={creationForm}
        onSubmit={createList}
        open={isCreationOpen}
        toggleOpen={toggleCreationOpen}
        title="Создать новый список заказов"
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="label">Текущий список:</div>
        <Select value={currentList} onChange={handleListChange}>
          {lists.map(({ name, uuid }) => (
            <MenuItem value={uuid} key={uuid}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={toggleCreationOpen}>
        Новый список
      </Button>
      <Tooltip title="Изменение настроек пока что недоступно">
        <span>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={toggleSettingsOpen} disabled>
            Настройки
          </Button>
        </span>
      </Tooltip>
      <MuiThemeProvider theme={successTheme}>
        {isConnected ? (
          <Button variant="outlined" onClick={handleDisconnect}>
            Закрыть голосование
          </Button>
        ) : (
          <Button variant="outlined" color="primary" disabled={!listInfo.command} onClick={handleConnect}>
            Открыть голосование
          </Button>
        )}
      </MuiThemeProvider>
    </div>
  );
};

export default RequestsDataPanel;
