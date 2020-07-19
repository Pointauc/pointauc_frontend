import React from 'react';
import './App.scss';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import ControlColumn from '../ControlColumn/ControlColumn';
import SlotsColumn from '../SlotsColumn/SlotsColumn';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const App: React.FC = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <Paper className="App" square>
        <SlotsColumn />
        <ControlColumn />
      </Paper>
    </MuiThemeProvider>
  );
};

export default App;
