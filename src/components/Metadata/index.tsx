import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import Essentials from '@components/Metadata/Essentials.tsx';
import StructuredData from '@components/Metadata/StructuredData.tsx';

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

  return createPortal(
    <>
      <Essentials />
      <StructuredData />
    </>,
    document.head,
  );
};

export default Metadata;
