import { generateSidebar } from 'vitepress-sidebar';
import { defineConfig } from 'vitepress';

export default defineConfig({
  // site-level options
  title: 'Pointauc',
  srcDir: 'src',
  cleanUrls: true,

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    logo: '/logo.png',
    sidebar: generateSidebar({
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
    }),
    nav: [{ text: 'Back to the main site', link: 'https://pointauc.com' }],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
    },
  },
});
