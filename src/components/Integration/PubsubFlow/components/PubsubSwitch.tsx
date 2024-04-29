import { FC, useCallback, useEffect, useState } from 'react';
import { Switch, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import withLoading from '@decorators/withLoading.ts';
import { setSubscribeState } from '@reducers/Subscription/Subscription.ts';

import './PubsubSwitch.scss';
import classNames from 'classnames';

const PubsubSwitch: FC<Integration.PubsubComponentProps> = ({ integration }) => {
  const { id, pubsubFlow } = integration;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { actual, loading } = useSelector((root: RootState) => root.subscription[id]);
  const [enabled, setEnabled] = useState<boolean>(actual);
  const Icon = integration.branding.icon;
  const user = useSelector((root: RootState) => root.user);

  useEffect(() => {
    setEnabled(actual);
  }, [actual]);

  const handleSwitchChange = useCallback(
    (e: any, checked: boolean): void => {
      setEnabled(checked);
      const userId = user.authData[id]?.id;

      if (!userId) {
        setEnabled(actual);
        return;
      }

      const onLoadingChanged = (loading: boolean) => {
        if (!loading && !pubsubFlow.async) return;

        return dispatch(setSubscribeState({ state: { loading }, id }));
      };

      withLoading(onLoadingChanged, async () => {
        if (checked) {
          await pubsubFlow.connect(userId);
        } else {
          await pubsubFlow.disconnect();
        }
      })().catch(() => setEnabled(actual));
    },
    [actual, dispatch, id, pubsubFlow, user.authData],
  );

  return (
    <div className={classNames('row integration-switch', id)}>
      <div className='col'>
        <Icon className='base-icon' />
        <Typography className='label'>{t(`integration.${id}.name`)}</Typography>
      </div>
      <Switch onChange={handleSwitchChange} disabled={loading} checked={enabled} />
    </div>
  );
};

export default PubsubSwitch;
