import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import tmi, { Badges, ChatUserstate } from 'tmi.js';
import { useParams } from 'react-router';
import { CHAT_WHEEL_PREFIX, WheelCommand } from '../../constants/wheel';
import { WheelItem } from '../../models/wheel.model';
import useWheel from '../../hooks/useWheel';
import { getWheelColor } from '../../utils/common.utils';

const getOpts = (channel: string) => ({
  identity: {
    username: 'skipsome_bot',
    password: 'oauth:bzel1k13fcfoldritkwjbejzx42m2g',
  },
  channels: [channel],
});

const USER_BADGES = ['founder', 'subscriber', 'broadcaster'];
const MODERATOR_BADGES = ['broadcaster'];

const getCommand = (command: WheelCommand): string => `${CHAT_WHEEL_PREFIX}${command}`;
const checkBadges = (badges: Badges, validBadges: string[]): boolean =>
  Object.keys(badges).some((badge) => validBadges.includes(badge));

// const getRandomColor = (): string =>
//   `#${Math.floor(Math.random() * 2 ** 24)
//     .toString(16)
//     .padStart(6, '0')}`;
// const createItem = (index: number): WheelItem => ({
//   id: index.toString(),
//   name: Math.random()
//     .toString()
//     .slice(0, Math.floor(Math.random() * 15 + 5)),
//   color: colors[Math.floor(Math.random() * colors.length)],
// });
// const defaultItems: WheelItem[] = Array(20)
//   .fill(null)
//   .map((value, index) => createItem(index));

const ChatWheelPage: FC = () => {
  const [participants, setParticipants] = useState<WheelItem[]>([]);
  const isRegOpened = useRef<boolean>(true);
  const [winners, setWinners] = useState<WheelItem[]>([]);
  const isSpinning = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const { channel } = useParams();

  const existUsers = useRef<WheelItem[]>([]);
  useEffect(() => {
    existUsers.current = [...participants, ...winners];
  }, [participants, winners]);

  const removeParticipant = ({ id }: WheelItem): void => {
    setParticipants((prevState) => prevState.filter((item) => item.id !== id));
  };

  const winner = useRef<WheelItem>();
  const handleWinner = (newWinner: WheelItem): void => {
    winner.current = newWinner;
    setWinners((prevWinners) => [...prevWinners, newWinner]);
    isSpinning.current = false;
  };

  const { spin, wheelComponent } = useWheel({ rawItems: participants, onWin: handleWinner, spinTime: 6000 });

  const spinRef = useRef(spin);
  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  const handleConnection = useCallback(() => {
    console.log(`Connected`);
    // setTimeout(() => spinRef.current(), 1000);
  }, []);

  const handleJoin = (userId: string, name: string, badges: Badges): void => {
    if (checkBadges(badges, USER_BADGES) && !existUsers.current.find(({ id }) => id === userId)) {
      const newParticipant: WheelItem = { id: userId, color: getWheelColor(), name };

      setParticipants((prevState) => [...prevState, newParticipant]);
    }
  };

  const handleMessage = useCallback((channelName: string, userState: ChatUserstate, message: string) => {
    const { 'display-name': name = '', badges, 'user-id': userId = Math.random().toString() } = userState;

    switch (message) {
      case getCommand(WheelCommand.Join):
        if (isRegOpened.current && !isSpinning.current && badges) {
          handleJoin(userId, name, badges);
        }
        break;

      case getCommand(WheelCommand.Spin):
        if (badges && checkBadges(badges, MODERATOR_BADGES)) {
          if (winner.current) {
            removeParticipant(winner.current);
          }

          if (!isSpinning.current) {
            spinRef.current();
            isSpinning.current = true;
          }
        }

        break;

      case getCommand(WheelCommand.CloseReg):
        if (badges && checkBadges(badges, MODERATOR_BADGES)) {
          isRegOpened.current = false;
        }
        break;

      case getCommand(WheelCommand.OpenReg):
        if (badges && checkBadges(badges, MODERATOR_BADGES)) {
          isRegOpened.current = true;
        }
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line new-cap
    const client = new tmi.client(getOpts(channel));

    client.on('connected', handleConnection);
    client.on('message', handleMessage);

    client.connect();

    return (): void => {
      client.disconnect();
    };
  }, [channel, handleConnection, handleMessage]);

  return <div style={{ width: '100vw', height: '100vh' }}>{wheelComponent}</div>;
};

export default ChatWheelPage;
