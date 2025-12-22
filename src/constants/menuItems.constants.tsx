import HelpIcon from '@mui/icons-material/Help';
import LayersIcon from '@mui/icons-material/Layers';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import AuctionSvg from '@assets/icons/auction.svg?react';
import WheelSvg from '@assets/icons/wheel.svg?react';
import { MenuItem } from '@models/common.model';
import { RootState } from '@reducers';

import { config } from './config';
import ROUTES from './routes.constants';

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

export const useActiveMenu = (items: MenuItem[]): MenuItem | undefined => {
  const { pathname } = useLocation();

  return items.find((item) => matchPath(item.pathMatch ?? item.path, pathname) !== null);
};

export const useMenuItems = (): MenuItem[] => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const userId = useSelector((root: RootState) => root.user.userId);

  const docsPath =
    locale === docsDefaultLocale || !docsLocales.includes(locale)
      ? `${config.docs.baseUrl}/`
      : `${config.docs.baseUrl}/${locale}`;

  return [
    { title: 'menu.items.auction.title', icon: <AuctionSvg fill='currentColor' />, path: ROUTES.HOME },
    {
      title: 'menu.items.settings.title',
      icon: <SettingsIcon />,
      path: ROUTES.SETTINGS,
      navbarFixedState: 'opened',
      pathMatch: `${ROUTES.SETTINGS}/*`,
    },
    { title: 'menu.items.wheel.title', icon: <WheelSvg />, path: ROUTES.WHEEL, navbarFixedState: 'closed' },
    // {
    //   title: 'menu.items.statistics.title',
    //   icon: <EqualizerIcon />,
    //   path: ROUTES.STATISTIC,
    //   navbarFixedState: 'opened',
    // },
    // { title: 'menu.items.history.title', icon: <AssignmentIcon />, path: ROUTES.HISTORY, navbarFixedState: 'opened' },
    { title: 'menu.items.overlays.title', icon: <LayersIcon />, path: ROUTES.OVERLAYS, isBeta: true },
    // { title: 'menu.items.test.title', icon: <ScienceIcon />, path: ROUTES.TEST, navbarFixedState: 'opened' },
    { title: 'menu.items.guides.title', icon: <HelpIcon />, divide: true, path: docsPath, target: '_blank' },
    {
      title: 'menu.items.ticketVerification.title',
      icon: <VerifiedUserIcon />,
      path: ROUTES.TICKET_VERIFICATION_INFO,
    },
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
