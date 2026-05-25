import { Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { parseMarkdownLotLink } from '@domains/links/lib/lotNameLink';
import ROUTES from '@constants/routes.constants';
import { LotLinkParser } from '@domains/links/participant-url-parsing/shared/LotLinkParser';

const LOT_LINK_PARSING_NOTIFICATION_STORAGE_KEY = 'auc.lotLinkParsing.noticeSeen';
const LOT_LINK_PARSING_NOTIFICATION_ID = 'lot-link-parsing-first-transform';

export const showLotParsingNotification = (parsingResult: any, lotLinkParser: LotLinkParser, name: string) => {
  const hasSeenLotLinkParsingNotificationInStorage =
    localStorage.getItem(LOT_LINK_PARSING_NOTIFICATION_STORAGE_KEY) === 'true';

  if (!hasSeenLotLinkParsingNotificationInStorage) {
    const parsedMarkdownLink = parseMarkdownLotLink(parsingResult.lotName);
    const parsedText = parsedMarkdownLink?.label ?? parsingResult.parsed.metadata.title;
    const sourceLink = lotLinkParser.detectedLinkUrl ?? name;

    notifications.show({
      id: LOT_LINK_PARSING_NOTIFICATION_ID,
      title: t('lot.linkParsingNotice.title'),
      message: (
        <Trans
          i18nKey='lot.linkParsingNotice.message'
          values={{
            sourceLink,
            parsedText,
          }}
          components={{
            settingsLink: (
              <Anchor
                component={Link}
                to={ROUTES.SETTINGS}
                style={{ color: '#228be6', textDecoration: 'underline' }}
                onClick={() => notifications.hide(LOT_LINK_PARSING_NOTIFICATION_ID)}
              />
            ),
          }}
        />
      ),
      color: 'blue',
      autoClose: 8_000,
      withCloseButton: true,
      position: 'bottom-right',
    });
    localStorage.setItem(LOT_LINK_PARSING_NOTIFICATION_STORAGE_KEY, 'true');
  }
};
