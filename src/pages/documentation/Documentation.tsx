import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.scss';

const Documentation: FC = () => {
  const { t } = useTranslation();

  return (
    <div className='documentation'>
      <div dangerouslySetInnerHTML={{ __html: t('documentation.content') }} />
      <ul>
        <li>Discord — kozjar#4193</li>
        <li>Telegram — @kozjarych</li>
        <li>Twitch — kozjar</li>
      </ul>
    </div>
  );
};

export default Documentation;
