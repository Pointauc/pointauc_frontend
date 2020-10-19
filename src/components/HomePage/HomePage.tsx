import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.constants';

const HomePage: React.FC = () => {
  return (
    <div>
      <Link to={ROUTES.AUC_PAGE}>Аукцион</Link>
      <Link to={ROUTES.VIDEO_REQUESTS}>Видео реквесты</Link>
      <Link to={ROUTES.CHAT_BOT}>Чат бот</Link>
    </div>
  );
};

export default HomePage;
