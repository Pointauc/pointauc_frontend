import React, { FC } from 'react';
import { Divider, Grid, Typography } from '@material-ui/core';
import classNames from 'classnames';
import './Changelog.scss';
import { UpdateData } from '../../utils/changelog';

interface ChangelogProps {
  updates: UpdateData[];
}

interface FeaturesListProps {
  title: string;
  data: string[];
  color: 'success' | 'info' | 'error';
}

const FeaturesList: FC<FeaturesListProps> = ({ title, data, color }) => (
  <Grid>
    <div>
      <span className={classNames('feature-title', color)}>{title}</span>
    </div>
    <ul className="changelog-features">
      {data.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ul>
  </Grid>
);

const Changelog: FC<ChangelogProps> = ({ updates }) => {
  return (
    <Grid className="changelog">
      {updates.map(({ date, newFeatures, improvements, fixes }) => (
        <Grid container spacing={2} key={date}>
          <Grid className="changelog-date" container item justify="center" alignItems="center">
            <Divider className="changelog-date-divider" />
            <Typography className="changelog-date-text">{date}</Typography>
            <Divider className="changelog-date-divider" />
          </Grid>
          <Grid item>
            <FeaturesList title="Новый функкционал" data={newFeatures} color="success" />
            <FeaturesList title="Улучшения" data={improvements} color="info" />
            <FeaturesList title="Исправлено" data={fixes} color="error" />
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default Changelog;
