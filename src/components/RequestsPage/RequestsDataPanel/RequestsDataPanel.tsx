import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, MenuItem, MuiThemeProvider, Select } from '@material-ui/core';
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
  setCurrentList,
  setWinnersList,
  updateFromCamilleBot,
  updateRequestsList,
} from '../../../reducers/Requests/Requests';
import ListSettingsDialog from './ListSettings/ListSettingsDialog';
import { useChatBot } from '../../../hooks/useChatBot';
import LoadingButton from '../../LoadingButton/LoadingButton';

const newListTemplate: RequestsListInfo = {
  uuid: v4(),
  name: 'Новый список',
  command: '!play',
};

const RequestsDataPanel: FC = () => {
  const dispatch = useDispatch();
  const { lists } = useSelector((root: RootState) => root.requests);
  const { username: channelName } = useSelector((root: RootState) => root.user);
  const [selectedList, setSelectedList] = useState<string>(lists[0].uuid);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreationOpen, setIsCreationOpen] = useState<boolean>(false);

  const currentList = useMemo(() => lists.find(({ uuid }) => selectedList === uuid), [lists, selectedList]);

  const settingsForm = useForm<RequestsListInfo>({ defaultValues: currentList });
  const { reset } = settingsForm;

  useEffect(() => {
    reset(currentList);
  }, [currentList, reset]);

  const creationForm = useForm<RequestsListInfo>({ defaultValues: newListTemplate });

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prevOpen) => !prevOpen);
  }, []);

  const toggleCreationOpen = useCallback(() => {
    setIsCreationOpen((prevOpen) => !prevOpen);
  }, []);

  const updateSettings = useCallback(
    (data: RequestsListInfo) => {
      dispatch(updateRequestsList({ id: selectedList, data }));
      toggleSettingsOpen();
    },
    [dispatch, selectedList, toggleSettingsOpen],
  );

  const createList = useCallback(
    (data: RequestsListInfo) => {
      const uuid = v4();

      dispatch(addRequestsList({ ...data, uuid }));
      setSelectedList(uuid);
      toggleCreationOpen();
    },
    [dispatch, toggleCreationOpen],
  );

  const handleListChange = useCallback((event: ChangeEvent<any>) => setSelectedList(event.target.value), []);

  useEffect(() => {
    if (Object.values<any>(CamilleList).includes(selectedList) && channelName) {
      dispatch(updateFromCamilleBot(channelName, selectedList as CamilleList));
    } else {
      dispatch(setCurrentList([]));
    }

    dispatch(setWinnersList([]));
  }, [dispatch, selectedList, channelName]);

  const handleNewRequest = useCallback(
    ({ username: id = '', 'display-name': username = '', badges }: ChatUserstate, request?: string) => {
      if (!currentList?.subOnly || badges?.subscriber) {
        dispatch(addRequest({ username, id, request }));
      }
    },
    [currentList, dispatch],
  );

  const { connect, disconnect, isConnected, loading } = useChatBot(
    channelName || '',
    currentList?.command || '%',
    handleNewRequest,
  );

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
        <Select value={selectedList} onChange={handleListChange}>
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
      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        onClick={toggleSettingsOpen}
        disabled={currentList?.disabled}
      >
        Настройки
      </Button>
      <MuiThemeProvider theme={successTheme}>
        {isConnected ? (
          <Button variant="outlined" onClick={disconnect}>
            Закрыть голосование
          </Button>
        ) : (
          <LoadingButton
            isLoading={loading}
            variant="outlined"
            color="primary"
            disabled={!currentList?.command}
            onClick={connect}
          >
            Открыть голосование
          </LoadingButton>
        )}
      </MuiThemeProvider>
    </div>
  );
};

export default RequestsDataPanel;
