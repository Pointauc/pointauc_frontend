import { withSidebar } from 'vitepress-sidebar';
import { defineConfig } from 'vitepress';
import { withI18n } from 'vitepress-i18n';

const rootLocale = 'en';
const supportedLocales = {
  root: {
    label: 'English',
    lang: rootLocale,
    description: 'User manual for Pointauc website',
  },
  ru: {
    label: 'Русский',
    lang: 'ru',
    description: 'Руководство пользователя для сайта Pointauc',
  },
};

const supportedLocaleKeys = Object.values(supportedLocales).map((locale) => locale.lang);

const vitepressOptions = {
  // site-level options
  title: 'Pointauc',
  description: 'User manual for Pointauc website',
  srcDir: 'src',
  cleanUrls: true,
  base: '/docs/',
  locales: supportedLocales,

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    logo: '/logo.png',
    nav: [{ text: 'Back to the main site', link: 'https://pointauc.com' }],
    outline: {
      level: [2, 3],
    },
  },

  rewrites: {
    'en/:rest*': ':rest*',
  },
};

const commonSidebarConfigs = {
  srcDir: 'src',
  useTitleFromFrontmatter: true,
  documentRootPath: 'docs/src',
  removePrefixAfterOrdering: true,
  prefixSeparator: '.',
  sortMenusByFrontmatterOrder: true,
  collapse: true,
  collapseDepth: 3,
  includeRootIndexFile: true,
  useFolderTitleFromIndexFile: true,
};

const vitePressSidebarConfigs = [
  ...supportedLocaleKeys.map((lang) => {
    return {
      ...commonSidebarConfigs,
      ...(rootLocale === lang ? {} : { basePath: `/${lang}/` }), // If using `rewrites` option
      documentRootPath: `/docs/src/${lang}`,
      resolvePath: rootLocale === lang ? '/' : `/${lang}/`,
    };
  }),
];

const vitePressI18nOptions = {
  searchProvider: 'local',
  rootLocale: rootLocale,
  locales: supportedLocales,
};

export default defineConfig(withSidebar(withI18n(vitepressOptions, vitePressI18nOptions), vitePressSidebarConfigs));
