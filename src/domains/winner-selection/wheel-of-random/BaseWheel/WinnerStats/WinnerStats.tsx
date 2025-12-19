import { Paper, Group, Tooltip, Text } from '@mantine/core';
import { IconTarget, IconUsersGroup } from '@tabler/icons-react';
import { t } from 'i18next';

import classes from './WinnerStats.module.css';

interface WinnerStatsProps {
  winChance: number;
  amountCategoryChance?: number | null;
}

const WinnerStats = (props: WinnerStatsProps) => {
  const { winChance, amountCategoryChance } = props;
  return (
    <Paper className={classes.statsSection} withBorder p='xs' mt='md'>
      <Group gap='md' justify='center'>
        <Tooltip label={t('wheel.winnerStats.winChanceDesc')} position='bottom' multiline maw={320} withArrow>
          <div className={classes.statCard}>
            <div className={classes.statIcon}>
              <IconTarget size={24} />
            </div>
            <div className={classes.statContent}>
              <Text className={classes.statLabel} size='xs' c='dimmed'>
                {t('wheel.winnerStats.winChance')}
              </Text>
              <Text className={classes.statValue} size='lg' fw={700}>
                {(winChance * 100).toFixed(2)}%
              </Text>
            </div>
          </div>
        </Tooltip>
        {amountCategoryChance && amountCategoryChance < 1 && (
          <Tooltip
            label={t('wheel.winnerStats.amountCategoryChanceDesc')}
            position='bottom'
            multiline
            maw={320}
            withArrow
          >
            <div className={classes.statCard}>
              <div className={classes.statIcon}>
                <IconUsersGroup size={24} />
              </div>
              <div className={classes.statContent}>
                <Text className={classes.statLabel} size='xs' c='dimmed'>
                  {t('wheel.winnerStats.amountCategoryChance')}
                </Text>
                <Text className={classes.statValue} size='lg' fw={700}>
                  {(amountCategoryChance * 100).toFixed(2)}%
                </Text>
              </div>
            </div>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
};

export default WinnerStats;
