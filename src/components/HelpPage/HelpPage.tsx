import React, { FC } from 'react';
import PageContainer from '../PageContainer/PageContainer';
import './HelpPage.scss';
import Documentation from '../../pages/documentation/Documentation';
import TableOfContents from '../TableOfContents/TableOfContents';
import { DOCUMENTATION_PARAGRAPHS } from '../../constants/documentation';
import ROUTES from '../../constants/routes.constants';

const HelpPage: FC = () => {
  return (
    <PageContainer title="Гайд" className="help-page">
      <div className="content">
        <Documentation />
        <TableOfContents paragraphs={DOCUMENTATION_PARAGRAPHS} url={ROUTES.HELP} />
      </div>
    </PageContainer>
  );
};

export default HelpPage;
