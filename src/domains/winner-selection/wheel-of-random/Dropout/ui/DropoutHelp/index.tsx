import { Anchor } from '@mantine/core';
import { Trans, useTranslation } from 'react-i18next';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';

export const DropoutHelp = () => {
  const { t } = useTranslation();
  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.dropout.page);

  return (
    <FirstTimeHelpNotification
      featureKey='dropoutHelpSeen'
      title={t('wheel.dropout.helpNotification.title')}
      message={
        <Trans
          i18nKey='wheel.dropout.helpNotification.message'
          components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' />, 2: <b /> }}
        />
      }
    />
  );
};
