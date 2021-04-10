import React, { FC, useCallback, useMemo, useState } from 'react';
import PageContainer from '../PageContainer/PageContainer';
import { PurchaseLog } from '../../reducers/Purchases/Purchases';
import { store } from '../../index';
import Scoreboard from './Scoreboard/Scoreboard';
import { Score } from '../../models/statistic';
import UsersChart from './UsersChart/UsersChart';
import { createMapByKey } from '../../utils/common.utils';
import SlotsChart from './SlotsChart/SlotsChart';

const COST_SELECTOR = {
  ALL: ({ cost }: PurchaseLog): number => cost,
  DONATION: ({ cost, isDonation }: PurchaseLog): number => (isDonation ? cost : 0),
  POINTS: ({ cost, isDonation }: PurchaseLog): number => (isDonation ? 0 : cost),
};

const hasTarget = ({ target }: PurchaseLog): boolean => !!target;

const Statistic: FC = () => {
  const [selectorKey] = useState<keyof typeof COST_SELECTOR>('ALL');
  const usersMap = useMemo(() => {
    const { history } = store.getState().purchases;

    return createMapByKey(history, ({ username }) => username, hasTarget);
  }, []);

  const slotsMap = useMemo(() => {
    const { history } = store.getState().purchases;
    const { slots } = store.getState().slots;
    const getSlotName = ({ target }: PurchaseLog): string => slots.find(({ id }) => id === target)?.name || '';

    return createMapByKey(history, getSlotName, hasTarget);
  }, []);

  const createScoreboard = useCallback(
    (map: Map<string, PurchaseLog[]>): Score[] => {
      const scores: Score[] = [];
      map.forEach((bids, title) => {
        const score = bids.reduce<number>((accum, bid) => accum + Math.abs(COST_SELECTOR[selectorKey](bid)), 0);

        if (score) {
          scores.push({ title, score });
        }
      });

      return scores.sort(({ score: a }, { score: b }) => b - a);
    },
    [selectorKey],
  );

  const userScoreboard = useMemo(() => createScoreboard(usersMap), [createScoreboard, usersMap]);

  const slotsScoreboard = useMemo(() => createScoreboard(slotsMap), [createScoreboard, slotsMap]);

  return (
    <div>
      <PageContainer title="Статистика">
        <div style={{ display: 'flex', paddingBottom: 30 }}>
          <Scoreboard scoreboard={userScoreboard} />
          <UsersChart scoreboard={userScoreboard} />
        </div>
        <div style={{ display: 'flex' }}>
          <Scoreboard scoreboard={slotsScoreboard} />
          <SlotsChart slotsMap={slotsMap} />
        </div>
      </PageContainer>
    </div>
  );
};

export default Statistic;
