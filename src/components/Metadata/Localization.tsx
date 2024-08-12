import React, { useMemo } from 'react';

const locales = ['ru'];

const Localization = () => {
  const defaultHost = useMemo(() => {
    const regex = new RegExp(`^(?:(?:${locales.join('|')})\\.)?(.*)`);

    return regex.exec(window.location.host)?.[1];
  }, []);

  return (
    <>
      {locales.map((lang) => (
        <link key={lang} rel='alternate' hrefLang={lang} href={`${window.location.protocol}//${lang}.${defaultHost}`} />
      ))}
      <link rel='alternate' hrefLang='en' href={`${window.location.protocol}//${defaultHost}`} />
      <link rel='alternate' hrefLang='x-default' href={`${window.location.protocol}//${defaultHost}`} />
    </>
  );
};

export default Localization;
