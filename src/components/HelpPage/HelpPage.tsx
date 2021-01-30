import React, { FC } from 'react';
import { Link, Typography } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import SettingsGroupTitle from '../SettingsGroupTitle/SettingsGroupTitle';
import './HelpPage.scss';

const HelpPage: FC = () => {
  return (
    <PageContainer title="Справка" className="help-page">
      <SettingsGroupTitle title="Контакты" />
      <Typography variant="body1">Kozjar (создатель аука):</Typography>
      <Typography variant="body2">
        Поддержка -
<Link href="https://www.donationalerts.com/r/kozjar"> https://www.donationalerts.com/r/kozjar</Link>
      </Typography>
      <Typography variant="body2">Discord - kozjar#4193</Typography>
      <Typography variant="body2">Telegram - @Cougho</Typography>

      <Typography variant="body1">DimusicJ (другой разраб):</Typography>
      <Typography variant="body2">Discord - DimusicJ#3988</Typography>

      <Typography variant="body1">Спонсоры аука</Typography>
      <Typography variant="body2">
        Shizov -
<Link href="https://www.twitch.tv/shizov"> https://www.twitch.tv/shizov</Link>
      </Typography>
      <SettingsGroupTitle title="Советы" />
      <Typography variant="body2">
        Обзор основных фич (1:00) -
<Link href="https://i.imgur.com/P6TUDXV.mp4"> https://i.imgur.com/P6TUDXV.mp4</Link>
      </Typography>
      <Typography variant="body2">
        Когда вы добавляете ставку в слот, следующие ставки с таким же сообщением добавятся автоматически
      </Typography>
      <Typography variant="body2">Чтобы отнимать поинты надо написать "-" в начале сообщения ("-дота 2")</Typography>
      <Typography variant="body2">При закрытии вкладки награды автоматически удалятся через ~ 20 секунд</Typography>
      <Typography variant="body2">Нельзя создавать награды одной стоимости!</Typography>
    </PageContainer>
  );
};

export default HelpPage;
