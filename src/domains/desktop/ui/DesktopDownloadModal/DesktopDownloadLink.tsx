import { Anchor, AnchorProps } from '@mantine/core';
import { FC, MouseEvent, PropsWithChildren } from 'react';

import { openDesktopDownloadModal } from '@domains/desktop/ui/DesktopDownloadModal/openDesktopDownloadModal';

interface DesktopDownloadLinkProps extends AnchorProps {
  className?: string;
}

export const DesktopDownloadLink: FC<PropsWithChildren<DesktopDownloadLinkProps>> = ({
  children,
  className,
  ...props
}) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openDesktopDownloadModal();
  };

  return (
    <Anchor
      component='a'
      href='#desktop-download'
      onClick={handleClick}
      underline='always'
      className={className}
      {...props}
    >
      {children}
    </Anchor>
  );
};

export default DesktopDownloadLink;
