import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { config } from './config';

export const DOCS_PAGES = {
  home: {
    page: '',
  },
  wheel: {
    settings: {
      page: '2.wheel-of-luck/1.settings-overview',
    },
    dropout: {
      page: '2.wheel-of-luck/2.formats/2.dropout',
      chapters: {
        simulated: '2.wheel-of-luck/2.formats/2.dropout#simulated-modern-dropout-←-recommended',
        classic: '2.wheel-of-luck/2.formats/2.dropout#classic-dropout',
      },
    },
    duel: {
      page: '2.wheel-of-luck/2.formats/3.battle-royal',
    },
  },
};

export const buildDocsUrl = (page: string, locale: string) => {
  return `${config.docs.baseUrl}/${locale}/${page}`;
};

export const useDocsUrl = (page: string) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  return useMemo(() => buildDocsUrl(page, locale), [locale, page]);
};
