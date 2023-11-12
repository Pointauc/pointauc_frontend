import { FC } from 'react';
import classNames from 'classnames';
import { Divider, Grid, Typography } from '@mui/material';

import { UpdateData } from '@utils/changelog.ts';

import './Changelog.scss';

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
    <ul className='changelog-features'>
      {data.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ul>
  </Grid>
);

const Changelog: FC<ChangelogProps> = ({ updates }) => {
  return (
    <Grid className='changelog'>
      {updates.map(({ date, newFeatures, improvements, fixes }) => (
        <Grid container spacing={2} key={date}>
          <Grid className='changelog-date' container item justifyContent='center' alignItems='center'>
            <Divider className='changelog-date-divider' />
            <Typography className='changelog-date-text'>{date}</Typography>
            <Divider className='changelog-date-divider' />
          </Grid>
          <Grid item>
            {newFeatures && <FeaturesList title='Новый функкционал' data={newFeatures} color='success' />}
            {improvements && <FeaturesList title='Улучшения' data={improvements} color='info' />}
            {fixes && <FeaturesList title='Исправлено' data={fixes} color='error' />}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default Changelog;
