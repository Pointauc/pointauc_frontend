import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Documentation from '@pages/documentation/Documentation';

import PageContainer from '../PageContainer/PageContainer';

import './HelpPage.scss';

const HelpPage: FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer title={t('menu.items.guides.title')} className='help-page'>
      <div className='content'>
        <Documentation />
        {/*<TableOfContents paragraphs={DOCUMENTATION_PARAGRAPHS} url={ROUTES.HELP} />*/}
      </div>
    </PageContainer>
  );
};

export default HelpPage;
