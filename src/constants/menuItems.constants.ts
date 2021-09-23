import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentIcon from '@material-ui/icons/Assignment';
import HelpIcon from '@material-ui/icons/Help';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { MenuItem } from '../models/common.model';
import { ReactComponent as AuctionSvg } from '../assets/icons/auction.svg';
import { ReactComponent as WheelSvg } from '../assets/icons/wheel.svg';
import ROUTES from './routes.constants';

const MENU_ITEMS: MenuItem[] = [
  { title: 'Аукцион', IconComponent: AuctionSvg, path: ROUTES.HOME },
  { title: 'Интеграция', IconComponent: AccountCircleIcon, path: ROUTES.INTEGRATION },
  { title: 'Настройки', IconComponent: SettingsIcon, path: ROUTES.SETTINGS },
  { title: 'Колесо рандома', IconComponent: WheelSvg, path: ROUTES.WHEEL },
  { title: 'Статистика', IconComponent: EqualizerIcon, path: ROUTES.STATISTIC },
  { title: 'История', IconComponent: AssignmentIcon, path: ROUTES.HISTORY },
  { title: 'Гайд', IconComponent: HelpIcon, path: ROUTES.HELP },
  { title: 'Заказы зрителей', IconComponent: HowToVoteIcon, path: ROUTES.REQUESTS, divide: true },
];

export default MENU_ITEMS;
