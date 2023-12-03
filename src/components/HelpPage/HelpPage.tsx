import { FC } from 'react';

import Documentation from '@pages/documentation/Documentation';
import { DOCUMENTATION_PARAGRAPHS } from '@constants/documentation.ts';
import ROUTES from '@constants/routes.constants';

import PageContainer from '../PageContainer/PageContainer';
import TableOfContents from '../TableOfContents/TableOfContents';

import './HelpPage.scss';

const HelpPage: FC = () => {
  return (
    <PageContainer title='Гайд' className='help-page'>
      <div className='content'>
        <Documentation />
        <TableOfContents paragraphs={DOCUMENTATION_PARAGRAPHS} url={ROUTES.HELP} />
      </div>
    </PageContainer>
  );
};

export default HelpPage;
