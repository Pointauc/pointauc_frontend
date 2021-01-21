import React, { FC } from 'react';
import { Link, Typography } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import SettingsGroupTitle from '../SettingsGroupTitle/SettingsGroupTitle';
import './HelpPage.scss';

const HelpPage: FC = () => {
  return (
    <PageContainer title="Справка" className="help-page">
      <SettingsGroupTitle title="Поддержка" />
      <Typography variant="body2">
        При желании можете поддержать аук деньгами, чтобы я смог купить нормальный домен и больше не приходилось
        скидывать людям эту длиннющую ссылку -
        <Link href="https://www.donationalerts.com/r/kozjar"> https://www.donationalerts.com/r/kozjar</Link>
      </Typography>
      <SettingsGroupTitle title="Гайды" />
      <Typography variant="body2">
        Обзор основных фич (1:00) -<Link href="https://i.imgur.com/P6TUDXV.mp4"> https://i.imgur.com/P6TUDXV.mp4</Link>
      </Typography>
      <Typography variant="body2">
        Отнимать поинты - для этого надо написать "-" в начале сообщения ("-дота 2")
      </Typography>
      <SettingsGroupTitle title="Нюансы" />
      <Typography variant="body2">Нельзя создавать награды одной стоимости или с фоном белого цвета!</Typography>
    </PageContainer>
  );
};

export default HelpPage;
