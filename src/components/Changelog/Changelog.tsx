import { FC, ReactNode } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Divider, Grid, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { UpdateData } from '@utils/changelog.tsx';

import './Changelog.scss';

interface ChangelogProps {
  updates: UpdateData[];
}

interface FeaturesListProps {
  title: string;
  data: ReactNode[];
  color: 'success' | 'info' | 'error';
}

const FeaturesList: FC<FeaturesListProps> = ({ title, data, color }) => (
  <Grid>
    <div>
      <span className={classNames('feature-title', color)}>{title}</span>
    </div>
    <ul className='changelog-features'>
      {data.map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </ul>
  </Grid>
);

const Changelog: FC<ChangelogProps> = ({ updates }) => {
  const { t } = useTranslation();

  return (
    <Grid className='changelog'>
      {updates.map(({ date, newFeatures, improvements, fixes, videoPreview }) => (
        <Grid container direction='column' spacing={2} key={date}>
          <Grid className='changelog-date' container item justifyContent='center' alignItems='center'>
            <Divider className='changelog-date-divider' />
            <Typography className='changelog-date-text'>{dayjs(date).format('YYYY-MM-DD HH:mm')}</Typography>
            <Divider className='changelog-date-divider' />
          </Grid>
          {videoPreview && (
            <Grid alignSelf='center' item>
              <Link href={videoPreview} target='_blank'>
                Video Preview
              </Link>
            </Grid>
          )}
          <Grid item>
            {newFeatures && (
              <FeaturesList title={t('changelog.types.functionality')} data={newFeatures} color='success' />
            )}
            {improvements && (
              <FeaturesList title={t('changelog.types.improvements')} data={improvements} color='info' />
            )}
            {fixes && <FeaturesList title={t('changelog.types.fixes')} data={fixes} color='error' />}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default Changelog;
