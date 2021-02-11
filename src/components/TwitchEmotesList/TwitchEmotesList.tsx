import React, { FC, useCallback, useEffect, useState } from 'react';
import { IconButton } from '@material-ui/core';
import { Collection, Emote, EmoteFetcher } from '@mkody/twitch-emoticons';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import './TwitchEmotesList..scss';

const fetcher = new EmoteFetcher();

interface TwitchEmotesListProps {
  setActiveEmote: (emote: string) => void;
}

const TwitchEmotesList: FC<TwitchEmotesListProps> = ({ setActiveEmote }) => {
  const { userId } = useSelector((root: RootState) => root.user);
  const [emotes, setEmotes] = useState<Collection<string, Emote>[]>([]);

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetcher.fetchTwitchEmotes(Number(userId)),
        fetcher.fetchBTTVEmotes(Number(userId)),
        fetcher.fetchFFZEmotes(Number(userId)),
      ]).then(setEmotes);
    }
  }, [userId]);

  const crateEmoteList = useCallback(
    (id: number) => {
      if (!emotes[id]) {
        return null;
      }

      return (
        <div className="emotes-group">
          {Array.from(emotes[id].values()).map((emote) => {
            const handleClick = (): void => setActiveEmote(emote.toLink(2));

            return (
              <IconButton key={emote.id} className="emote-button" onClick={handleClick}>
                <img alt="emote" src={emote.toLink(0)} />
              </IconButton>
            );
          })}
        </div>
      );
    },
    [emotes, setActiveEmote],
  );

  return (
    <div className="emotes-container">
      {crateEmoteList(0)}
      {crateEmoteList(1)}
      {crateEmoteList(2)}
    </div>
  );
};

export default TwitchEmotesList;
