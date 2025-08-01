import { Anchor } from '@mantine/core';
import { Trans } from 'react-i18next';

import { DOCS_PAGES, useDocsUrl } from '@constants/docs.constants';
import { FirstTimeHelpNotification } from '@components/FirstTimeHelpNotification';

export const DropoutHelp = () => {
  const docsUrl = useDocsUrl(DOCS_PAGES.wheel.dropout.page);

  return (
    <FirstTimeHelpNotification
      featureKey='dropoutHelpSeen'
      message={
        <Trans
          i18nKey='wheel.dropout.helpNotification'
          components={{ 1: <Anchor href={docsUrl} underline='not-hover' target='_blank' />, 2: <b /> }}
        />
      }
    />
  );
};
