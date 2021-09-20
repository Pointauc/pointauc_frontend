import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, MenuItem, MuiThemeProvider, Select } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import { RootState } from '../../../reducers';
import './RequestsDataPanel.scss';
import { successTheme } from '../../../constants/theme.constants';
import { CamilleList } from '../../../models/requests.model';
import { updateFromCamilleBot } from '../../../reducers/Requests/Requests';

const RequestsDataPanel: FC = () => {
  const dispatch = useDispatch();
  const { lists } = useSelector((root: RootState) => root.requests);
  const { username } = useSelector((root: RootState) => root.user);
  const [selectedList, setSelectedList] = useState<string>(lists[0].uuid);

  const handleListChange = useCallback((event: ChangeEvent<any>) => setSelectedList(event.target.value), []);

  useEffect(() => {
    if (Object.values<any>(CamilleList).includes(selectedList) && username) {
      dispatch(updateFromCamilleBot('praden', selectedList as CamilleList));
    }
  }, [dispatch, selectedList, username]);

  return (
    <div className="requests-list-panel">
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
      <Button variant="outlined" color="primary" startIcon={<AddIcon />}>
        Новый список
      </Button>
      <Button variant="outlined" startIcon={<SettingsIcon />}>
        Настройки
      </Button>
      <MuiThemeProvider theme={successTheme}>
        <Button variant="outlined" color="primary">
          Открыть голосование
        </Button>
      </MuiThemeProvider>
    </div>
  );
};

export default RequestsDataPanel;
