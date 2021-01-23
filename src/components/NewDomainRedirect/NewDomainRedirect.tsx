import React, { FC } from 'react';
import { Link } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import PageContainer from '../PageContainer/PageContainer';
import { theme } from '../../constants/theme.constants';
import Dovolen from '../../assets/img/Dovolen.png';
import './NewDomainRedirect.scss';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      display: 'flex',
      fontFamily: theme.typography.fontFamily,
      fontWeight: 300,
      minHeight: '100vh',
    },
  }),
);

const NewDomainRedirect: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <PageContainer>
        <div className="redirect-page">
          <div>
            <span>Аукцион переехал на новый крутой домен, заходите теперь через эту ссылку:</span>
            <Link href="https://pointauc.ru"> https://pointauc.ru</Link>
          </div>
          <img src={Dovolen} alt="Dovolen" />
        </div>
      </PageContainer>
    </div>
  );
};

export default NewDomainRedirect;
