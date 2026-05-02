// Handles async lot-link parsing lifecycle for the lot name input.
import { Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ROUTES from '@constants/routes.constants';
import { parseMarkdownLotLink } from '@domains/links/lib/lotNameLink';
import { LotLinkParser } from '@domains/links/participant-url-parsing/shared/LotLinkParser';
import {
  trackAuctionAutoParsedLotNameWithUrl,
  trackAuctionLotNameWithUrl,
} from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import useStorageState from '@hooks/useStorageState.ts';
import { RootState } from '@reducers';
import { setSlotName } from '@reducers/Slots/Slots';

interface UseLotLinkParsingParams {
  id: string;
  name: string | null;
  setCurrentName: (name: string) => void;
  setIsNameRawMode: (value: boolean) => void;
}

interface UseLotLinkParsingResult {
  isLoading: boolean;
  sourceName: string | null;
}

const LOT_LINK_PARSING_TIMEOUT_MS = 30_000;
const LOT_LINK_PARSING_NOTIFICATION_STORAGE_KEY = 'auc.lotLinkParsing.noticeSeen';
const LOT_LINK_PARSING_NOTIFICATION_ID = 'lot-link-parsing-first-transform';

export const useLotLinkParsing = ({
  id,
  name,
  setCurrentName,
  setIsNameRawMode,
}: UseLotLinkParsingParams): UseLotLinkParsingResult => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isLotLinkParsingEnabled = useSelector((root: RootState) => root.aucSettings.settings.isLotLinkParsingEnabled);
  const [isLotLinkParsingLoading, setIsLotLinkParsingLoading] = useState(false);
  const [loadingSourceName, setLoadingSourceName] = useState<string | null>(null);
  const parsingAbortControllerRef = useRef<AbortController | null>(null);
  const parsingRequestIdRef = useRef(0);

  useEffect(() => {
    parsingAbortControllerRef.current?.abort();
    parsingAbortControllerRef.current = null;

    if (!isLotLinkParsingEnabled || !name) {
      setIsLotLinkParsingLoading(false);
      setLoadingSourceName(null);
      return;
    }

    const lotLinkParser = new LotLinkParser(name);
    if (!lotLinkParser.hasValidSourceLink) {
      setIsLotLinkParsingLoading(false);
      setLoadingSourceName(null);
      return;
    }

    trackAuctionLotNameWithUrl({ lotId: id });

    const nextRequestId = parsingRequestIdRef.current + 1;
    parsingRequestIdRef.current = nextRequestId;

    const abortController = new AbortController();
    parsingAbortControllerRef.current = abortController;
    setIsLotLinkParsingLoading(true);
    setLoadingSourceName(lotLinkParser.sourceName);

    const timeoutId = setTimeout(() => {
      if (parsingRequestIdRef.current === nextRequestId) {
        setIsLotLinkParsingLoading(false);
      }
      abortController.abort();
    }, LOT_LINK_PARSING_TIMEOUT_MS);

    void lotLinkParser
      .replaceLinkWithMarkdown(abortController.signal)
      .then((parsingResult) => {
        if (!parsingResult || abortController.signal.aborted || parsingRequestIdRef.current !== nextRequestId) {
          return;
        }

        if (parsingResult.lotName === name) {
          return;
        }

        trackAuctionAutoParsedLotNameWithUrl({ lotId: id });

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

        setCurrentName(parsingResult.lotName);
        setIsNameRawMode(false);
        dispatch(setSlotName({ id, name: parsingResult.lotName }));
      })
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(timeoutId);
        if (parsingRequestIdRef.current === nextRequestId) {
          setIsLotLinkParsingLoading(false);
          setLoadingSourceName(null);
        }
      });

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [dispatch, id, isLotLinkParsingEnabled, name, setCurrentName, setIsNameRawMode, t]);

  return {
    isLoading: isLotLinkParsingLoading,
    sourceName: loadingSourceName,
  };
};
