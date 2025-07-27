import AssignmentIcon from '@mui/icons-material/Assignment';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import HelpIcon from '@mui/icons-material/Help';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AuctionSvg from '@assets/icons/auction.svg?react';
import WheelSvg from '@assets/icons/wheel.svg?react';
import { MenuItem } from '@models/common.model';
import { RootState } from '@reducers';

import ROUTES from './routes.constants';
import { config } from './config';

const MENU_ITEMS: MenuItem[] = [
  // { title: 'menu.items.auction.title', icon: AuctionSvg, path: ROUTES.HOME },
  // { title: 'menu.items.settings.title', icon: SettingsIcon, path: ROUTES.SETTINGS },
  // { title: 'menu.items.wheel.title', icon: WheelSvg as any, path: ROUTES.WHEEL },
  // { title: 'menu.items.statistics.title', icon: EqualizerIcon, path: ROUTES.STATISTIC },
  // { title: 'menu.items.history.title', icon: AssignmentIcon, path: ROUTES.HISTORY },
  // { title: 'menu.items.guides.title', icon: HelpIcon, path: ROUTES.HELP },
  // { title: 'menu.items.guides.title', icon: LogoutIcon, path: ROUTES.LOGOUT, divide: true },
  // {
  //   title: 'menu.items.viewer_orders.title',
  //   IconComponent: HowToVoteIcon,
  //   path: ROUTES.REQUESTS,
  //   divide: true,
  // },
];

const docsDefaultLocale = 'en';
const docsLocales = [docsDefaultLocale, 'ru'];

export const useMenuItems = (): MenuItem[] => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const userId = useSelector((root: RootState) => root.user.userId);

  const docsPath =
    locale === docsDefaultLocale || !docsLocales.includes(locale)
      ? `${config.docs.baseUrl}/`
      : `${config.docs.baseUrl}/${locale}`;

  return [
    { title: 'menu.items.auction.title', icon: <AuctionSvg fill='white' />, path: ROUTES.HOME },
    { title: 'menu.items.settings.title', icon: <SettingsIcon />, path: ROUTES.SETTINGS },
    { title: 'menu.items.wheel.title', icon: <WheelSvg />, path: ROUTES.WHEEL },
    { title: 'menu.items.statistics.title', icon: <EqualizerIcon />, path: ROUTES.STATISTIC },
    { title: 'menu.items.history.title', icon: <AssignmentIcon />, path: ROUTES.HISTORY },
    { title: 'menu.items.guides.title', icon: <HelpIcon />, divide: true, path: docsPath, target: '_blank' },
    ...(userId
      ? [
          {
            title: 'menu.items.logout.title',
            divide: true,
            icon: <LogoutIcon color='error' />,
            path: ROUTES.LOGOUT,
          },
        ]
      : []),
  ];
};

export default MENU_ITEMS;
