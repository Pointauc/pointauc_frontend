import { createBrowserHistory } from 'history';

interface LocationState {
  forcePush?: boolean;
}

const history = createBrowserHistory<LocationState>();

export default history;
