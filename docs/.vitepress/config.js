import { withSidebar } from 'vitepress-sidebar';
import { defineConfig } from 'vitepress';
import { withI18n } from 'vitepress-i18n';

const vitepressOptions = {
  // site-level options
  title: 'Pointauc',
  srcDir: 'src',
  cleanUrls: true,
  base: '/docs/',

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

const rootLocale = 'en';
const supportedLocales = [rootLocale, 'ru'];

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
  ...supportedLocales.map((lang) => {
    return {
      ...commonSidebarConfigs,
      ...(rootLocale === lang ? {} : { basePath: `/${lang}/` }), // If using `rewrites` option
      documentRootPath: `/docs/src/${lang}`,
      resolvePath: rootLocale === lang ? '/' : `/${lang}/`,
    };
  }),
];

const vitePressI18nOptions = {
  locales: supportedLocales,
  searchProvider: 'local',
};

export default defineConfig(withSidebar(withI18n(vitepressOptions, vitePressI18nOptions), vitePressSidebarConfigs));
