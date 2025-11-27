import { ReactNode } from 'react';

import { ChangeType } from '@domains/changelog/model/types';
import styles from '@domains/changelog/ui/Changelog.module.css';

interface ChangeSectionProps {
  type: ChangeType;
  items: ReactNode[];
  label: string;
  icon: ReactNode;
}

function ChangeSection({ type, items, label, icon }: ChangeSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`${styles.changeSection} ${styles[type]}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>{icon}</div>
        <span className={styles.sectionLabel}>{label}</span>
      </div>
      <ul className={styles.changesList}>
        {items.map((item, index) => (
          <li key={index} className={styles.changeItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChangeSection;
