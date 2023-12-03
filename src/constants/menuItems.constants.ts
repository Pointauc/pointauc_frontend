import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

import { MenuItem } from '@models/common.model';
import AuctionSvg from '@assets/icons/auction.svg?react';
import WheelSvg from '@assets/icons/wheel.svg?react';

import ROUTES from './routes.constants';

const MENU_ITEMS: MenuItem[] = [
  { title: 'Аукцион', IconComponent: AuctionSvg as any, path: ROUTES.HOME },
  { title: 'Интеграция', IconComponent: AccountCircleIcon, path: ROUTES.INTEGRATION },
  { title: 'Настройки', IconComponent: SettingsIcon, path: ROUTES.SETTINGS },
  { title: 'Колесо рандома', IconComponent: WheelSvg as any, path: ROUTES.WHEEL },
  { title: 'Статистика', IconComponent: EqualizerIcon, path: ROUTES.STATISTIC },
  { title: 'История', IconComponent: AssignmentIcon, path: ROUTES.HISTORY },
  { title: 'Гайд', IconComponent: HelpIcon, path: ROUTES.HELP },
  { title: 'Заказы зрителей', IconComponent: HowToVoteIcon, path: ROUTES.REQUESTS, divide: true },
];

export default MENU_ITEMS;
