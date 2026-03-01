import { FC, useEffect } from 'react';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';

const HelpPage: FC = () => {
  const docsUrl = useDocsUrl(DOCS_PAGES.home.page);

  useEffect(() => {
    window.location.href = docsUrl;
  }, [docsUrl]);

  return null;
};

export default HelpPage;
