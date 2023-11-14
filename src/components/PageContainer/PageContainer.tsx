import { FC } from 'react';
import { Container, ContainerProps, Typography } from '@mui/material';
import classNames from 'classnames';
import './PageContainer.scss';

// const useStyles = makeStyles((theme) =>
//   createStyles({
//     root: {
//       background: theme.palette.background.default,
//       color: theme.palette.text.primary,
//       height: '100vh',
//       paddingTop: theme.spacing(4),
//       paddingBottom: theme.spacing(4),
//       overflowX: 'hidden',
//       overflowY: 'auto',
//     },
//   }),
// );

interface PgeContainerProps extends ContainerProps {
  title?: string;
}

const PageContainer: FC<PgeContainerProps> = ({ title, children, className, ...props }) => {
  // const classes = useStyles();

  return (
    <Container className={classNames(className, 'page-container')} style={{ maxWidth: '95%' }} {...props}>
      {!!title && (
        <Typography color='textPrimary' variant='h3'>
          {title}
        </Typography>
      )}
      {children}
    </Container>
  );
};

export default PageContainer;
