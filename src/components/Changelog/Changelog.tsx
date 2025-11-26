import { Anchor, Divider, Grid, Text } from '@mantine/core';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { FC, ReactNode } from 'react';
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
        <Grid key={date}>
          <Grid className='changelog-date' justify='center' align='center'>
            <Divider />
            <Text className='changelog-date-text'>{dayjs(date).format('YYYY-MM-DD HH:mm')}</Text>
            <Divider />
          </Grid>
          {videoPreview && (
            <Grid justify='center'>
              <Anchor href={videoPreview} target='_blank'>
                Video Preview
              </Anchor>
            </Grid>
          )}
          <Grid>
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
