import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import Essentials from '@components/Metadata/Essentials.tsx';
import StructuredData from '@components/Metadata/StructuredData.tsx';
import Localization from '@components/Metadata/Localization.tsx';

/**
 * Returns true only in a real browser environment with a valid DOM.
 * Checking `HTMLElement` existence is more reliable than `typeof window` during SSR,
 * since the prerender script stubs `window` globally to prevent module-scope crashes.
 */
const isRealDom = typeof HTMLElement !== 'undefined';

const removeInitialMetadata = () => {
  const initialMeta = document.head.getElementsByClassName('initial-meta-to-be-removed');
  while (initialMeta.length > 0) {
    initialMeta[0].parentNode?.removeChild(initialMeta[0]);
  }
};

const Metadata = () => {
  useEffect(() => {
    removeInitialMetadata();
  }, []);

  // During SSR, head metadata is injected statically by the prerender script.
  // createPortal requires a real DOM node — not available in the Node.js render env.
  if (!isRealDom) return null;

  return createPortal(
    <>
      <Essentials />
      <Localization />
      <StructuredData />
    </>,
    document.head,
  );
};

export default Metadata;
