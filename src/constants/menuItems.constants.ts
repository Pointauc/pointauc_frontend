import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import HelpIcon from '@mui/icons-material/Help';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SettingsIcon from '@mui/icons-material/Settings';

import AuctionSvg from '@assets/icons/auction.svg?react';
import WheelSvg from '@assets/icons/wheel.svg?react';
import { MenuItem } from '@models/common.model';

import ROUTES from './routes.constants';

const MENU_ITEMS: MenuItem[] = [
  { title: 'menu.items.auction.title', IconComponent: AuctionSvg as any, path: ROUTES.HOME },
  { title: 'menu.items.settings.title', IconComponent: SettingsIcon, path: ROUTES.SETTINGS },
  { title: 'menu.items.wheel.title', IconComponent: WheelSvg as any, path: ROUTES.WHEEL },
  { title: 'menu.items.statistics.title', IconComponent: EqualizerIcon, path: ROUTES.STATISTIC },
  { title: 'menu.items.history.title', IconComponent: AssignmentIcon, path: ROUTES.HISTORY },
  { title: 'menu.items.guides.title', IconComponent: HelpIcon, path: ROUTES.HELP },
  // {
  //   title: 'menu.items.viewer_orders.title',
  //   IconComponent: HowToVoteIcon,
  //   path: ROUTES.REQUESTS,
  //   divide: true,
  // },
];

export default MENU_ITEMS;
