import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { UpdateData } from '@domains/changelog/model/types';
import UpdateEntry from '@domains/changelog/ui/UpdateEntry';
import styles from '@domains/changelog/ui/Changelog.module.css';

interface ChangelogProps {
  updates: UpdateData[];
}

const Changelog: FC<ChangelogProps> = ({ updates }) => {
  const { t } = useTranslation();

  if (updates.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✨</div>
        <div className={styles.emptyText}>{t('changelog.modal.title')}</div>
      </div>
    );
  }

  return (
    <div className={styles.changelog}>
      {updates.map((update, index) => (
        <UpdateEntry key={update.date || index} update={update} />
      ))}
    </div>
  );
};

export default Changelog;
