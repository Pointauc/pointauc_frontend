import { Anchor } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';

const NewDropoutDescription = () => {
  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.dropout.chapters.simulated);
  const { t } = useTranslation();

  return (
    <>
      <Anchor href={docsUrl} underline='not-hover' target='_blank'>
        {t('wheel.dropout.explanation.button')}
      </Anchor>
    </>
  );
};

export default NewDropoutDescription;
