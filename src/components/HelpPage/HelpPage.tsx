import { FC } from 'react';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';

const HelpPage: FC = () => {
  const docsUrl = useDocsUrl(DOCS_PAGES.home.page);

  window.location.href = docsUrl;

  return null;
};

export default HelpPage;
