import React from 'react';
import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';
import { Collapse, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch.tsx';
import { useSyncEffect } from '@shared/lib/react';

import TextWithHint from '../TextWithHint';

import styles from './SettingsGroup.module.css';

interface SettingsGroupProps {
  title: string;
  hint?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  controlName?: string;
  open?: boolean;
}

const SettingsGroup = ({ title, hint, controlName, children, className, open: _open = true }: SettingsGroupProps) => {
  const { control } = useFormContext();

  const [opened, { open, close }] = useDisclosure(_open);

  useSyncEffect(() => {
    if (_open) {
      open();
    } else {
      close();
    }
  }, [_open]);

  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.titleWrapper}>
        {controlName && (
          <FormSwitch
            name={controlName}
            control={control}
            classNames={{ body: styles.switchBody }}
            label={
              <TextWithHint hint={hint}>
                <Title className={styles.titleText} order={3}>
                  {title}
                </Title>
              </TextWithHint>
            }
          />
        )}
        {!controlName && (
          <TextWithHint hint={hint}>
            <Title className={styles.titleText} order={3}>
              {title}
            </Title>
          </TextWithHint>
        )}
      </div>
      <Collapse in={opened} transitionDuration={150}>
        <div className={styles.content}>{children}</div>
      </Collapse>
    </div>
  );
};

export default SettingsGroup;
