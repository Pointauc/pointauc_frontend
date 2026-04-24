import { Text } from '@mantine/core';
import { type ReactNode } from 'react';

interface SettingsSectionProps {
  id: string;
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

const SettingsSection = ({ id, title, icon, children }: SettingsSectionProps) => {
  return (
    <section className='flex flex-col gap-4'>
      <h2 id={id} className='flex flex-nowrap items-center gap-2 scroll-mt-6'>
        {icon ? (
          <span className='inline-flex text-[var(--mantine-primary-color-filled)]'>
            {icon}
          </span>
        ) : null}
        <Text component='span' fw={700} size='lg'>
          {title}
        </Text>
      </h2>
      {children}
    </section>
  );
};

export default SettingsSection;
