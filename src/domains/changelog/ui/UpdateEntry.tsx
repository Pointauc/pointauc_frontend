import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { UpdateData } from '@domains/changelog/model/types';
import styles from '@domains/changelog/ui/Changelog.module.css';
import ChangeSection from '@domains/changelog/ui/ChangeSection';
import { SparklesIcon, RocketIcon, WrenchIcon } from '@domains/changelog/ui/ChangelogIcons';

interface UpdateEntryProps {
  update: UpdateData;
}

function UpdateEntry({ update }: UpdateEntryProps) {
  const { t } = useTranslation();
  const formattedDate = dayjs(update.date).format('D MMMM YYYY');

  return (
    <div className={styles.updateEntry}>
      <div className={styles.dateMarker} />
      <div className={styles.dateText}>{formattedDate}</div>

      <ChangeSection
        type='newFeature'
        items={update.newFeatures ?? []}
        label={t('changelog.types.functionality')}
        icon={<SparklesIcon />}
      />

      <ChangeSection
        type='improvement'
        items={update.improvements ?? []}
        label={t('changelog.types.improvements')}
        icon={<RocketIcon />}
      />

      <ChangeSection type='fix' items={update.fixes ?? []} label={t('changelog.types.fixes')} icon={<WrenchIcon />} />
    </div>
  );
}

export default UpdateEntry;
