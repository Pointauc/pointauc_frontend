import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import { Title } from '@mantine/core';

import styles from './PageContainer.module.css';

interface PageContainerProps {
  title: string | ReactNode;
  className?: string;
  children: ReactNode;
  classes?: {
    content?: string;
  };
}

const PageContainer: FC<PageContainerProps> = ({ title, children, className, classes }) => {
  return (
    <div className={clsx(className, styles.pageContainer)}>
      {!!title && (typeof title === 'string' ? <Title order={1}>{title}</Title> : title)}
      <div className={clsx(styles.pageContainerContent, classes?.content)}>{children}</div>
    </div>
  );
};

export default PageContainer;
