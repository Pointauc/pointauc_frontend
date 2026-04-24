import { FC, ReactNode, RefObject } from 'react';
import clsx from 'clsx';
import { Title } from '@mantine/core';

import styles from './PageContainer.module.css';

interface PageContainerProps {
  title?: string | ReactNode;
  className?: string;
  children: ReactNode;
  fixedHeight?: boolean;
  classes?: {
    content?: string;
  };
  contentId?: string;
  contentRef?: RefObject<HTMLDivElement | null>;
  padding?: boolean;
}

const PageContainer: FC<PageContainerProps> = ({
  title,
  children,
  className,
  classes,
  fixedHeight,
  contentId,
  contentRef,
  padding = true,
}) => {
  return (
    <div
      className={clsx(className, styles.pageContainer, {
        [styles.fixedHeight]: fixedHeight,
        [styles.padding]: padding,
      })}
    >
      {!!title && (typeof title === 'string' ? <Title order={1}>{title}</Title> : title)}
      <div
        className={clsx(styles.pageContainerContent, classes?.content, { [styles.padding]: padding })}
        id={contentId}
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
