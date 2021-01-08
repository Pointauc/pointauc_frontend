import React, { FC, MutableRefObject } from 'react';
import { FormGroup } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form';
import SettingsGroupTitle from '../../../SettingsGroupTitle/SettingsGroupTitle';
import { SettingFields } from '../../../../reducers/AucSettings/AucSettings';

interface TwitchSettingsProps {
  formMethods: UseFormMethods;
  defaultSettings: SettingFields;
  isFormValuesChanged: MutableRefObject<boolean>;
  isSubscribed?: boolean;
  aucRewardPrefix?: string;
}

const TwitchSettings: FC<TwitchSettingsProps> = ({
  // formMethods,
  // defaultSettings,
  // isFormValuesChanged,
  // isSubscribed,
  aucRewardPrefix,
}) => {
  // const { register, setValue } = formMethods;
  // const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  // const { username } = useSelector((root: RootState) => root.user);
  // const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  // const [currentRewardPrefix, setCurrentRewardPrefix] = useState(defaultSettings.aucRewardPrefix);
  //
  // const handleSubscribeMessage = ({ data }: MessageEvent): void => {
  //   const { type } = JSON.parse(data);
  //   if (type === MESSAGE_TYPES.CP_SUBSCRIBED || type === MESSAGE_TYPES.CP_UNSUBSCRIBED) {
  //     setIsSubscribeLoading(false);
  //   }
  // };
  //
  // const subscribeTwitchPoints = useCallback((): void => {
  //   if (webSocket) {
  //     webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_SUBSCRIBE, username }));
  //   }
  // }, [username, webSocket]);
  //
  // const unsubscribeTwitchPoints = useCallback((): void => {
  //   if (webSocket) {
  //     webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_UNSUBSCRIBE, username }));
  //   }
  // }, [username, webSocket]);
  //
  // useEffect(() => {
  //   if (isFormValuesChanged.current) {
  //     setIsSubscribeLoading(true);
  //     isSubscribed ? subscribeTwitchPoints() : unsubscribeTwitchPoints();
  //   }
  // }, [isFormValuesChanged, isSubscribed, subscribeTwitchPoints, unsubscribeTwitchPoints]);
  //
  // useEffect(() => {
  //   if (webSocket) {
  //     webSocket.addEventListener('message', handleSubscribeMessage);
  //   }
  //
  //   return (): void => {
  //     if (webSocket) {
  //       webSocket.removeEventListener('message', handleSubscribeMessage);
  //     }
  //   };
  // }, [webSocket]);
  //
  // const requestMockData = (): void => {
  //   if (webSocket) {
  //     webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.MOCK_PURCHASE }));
  //   }
  // };
  //
  // const submitAucRewardPrefix = (): void => {
  //   setValue('aucRewardPrefix', currentRewardPrefix);
  // };
  //
  // const handleCurrentRewardChange = (e: ChangeEvent<HTMLInputElement>): void => {
  //   setCurrentRewardPrefix(e.target.value);
  // };
  //
  // const isSubscribedSwitch = (
  //   <Switch name="isSubscribed" inputRef={register} defaultChecked={defaultSettings.isSubscribed} />
  // );

  return (
    <>
      <SettingsGroupTitle title="Twitch" />
      <FormGroup className="auc-settings-list" />
    </>
  );
};

export default TwitchSettings;
