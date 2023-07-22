import React, { FC, useCallback, useEffect, useState } from 'react';
import { CircularProgress, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { EmoteFetcher, Collection, Emote } from '@kozjar/twitch-emoticons';
import { RootState } from '../../reducers';
import './TwitchEmotesList..scss';
import { getSevenTVEmotes } from '../../api/emotesApi';

const fetcher = new EmoteFetcher();

interface TwitchEmotesListProps {
  setActiveEmote: (emote: string) => void;
  onEmotesLoad?: (emotes: Emote[]) => void;
}

const flattenCollection = (collection: Collection<string, Emote>): Emote[] => Array.from<Emote>(collection.values());

const emoteLists = ['default', 'twitch', '7tv', 'bttv', 'ffz'];

const TwitchEmotesList: FC<TwitchEmotesListProps> = ({ setActiveEmote, onEmotesLoad }) => {
  const { userId } = useSelector((root: RootState) => root.user);
  const [userEmotes, setUserEmotes] = useState<(Emote[] | null)[]>();

  const updateEmotes = useCallback(async () => {
    // const defaultEmotes = sevenTVApi.fetchUserEmotes('minodos_99').then((emotes) => emotes.map(createSevenTVEmote));
    let loadedEmotes: Emote[];

    if (userId) {
      loadedEmotes = await Promise.all(
        [
          getSevenTVEmotes(userId),
          fetcher.fetchTwitchEmotes(Number(userId)).then(flattenCollection),
          fetcher.fetchBTTVEmotes(Number(userId)).then(flattenCollection),
          fetcher.fetchFFZEmotes(Number(userId)).then(flattenCollection),
        ].map((request) => request.catch(() => null)),
      );
    } else {
      loadedEmotes = [];
    }
    loadedEmotes = loadedEmotes.filter((value) => value != null);

    setUserEmotes(loadedEmotes);

    if (onEmotesLoad) {
      const flatEmotes = loadedEmotes.reduce((accum, emotes) => (emotes ? [...accum, ...emotes] : accum), []);
      onEmotesLoad(flatEmotes);
    }
  }, [onEmotesLoad, userId]);

  useEffect(() => {
    updateEmotes();
  }, [updateEmotes]);

  const crateEmoteList = useCallback(
    (emotes: Emote[] | null, id: string) => {
      if (!emotes) {
        return null;
      }

      return (
        <div className="emotes-group" key={id}>
          {emotes.map((emote) => {
            const { min = 0, max = 2 } = emote as any;
            const handleClick = (): void => setActiveEmote(emote.toLink(max));

            return (
              <IconButton key={emote.id} className="emote-button" onClick={handleClick}>
                <img alt="emote" src={emote.toLink(min)} />
              </IconButton>
            );
          })}
        </div>
      );
    },
    [setActiveEmote],
  );

  return (
    <div className="emotes-container">
      {userEmotes ? (
        <>{userEmotes.map((emotes, index) => crateEmoteList(emotes, emoteLists[index]))}</>
      ) : (
        <CircularProgress className="emotes-loading" />
      )}
      {!userId && <div className="emote-hint">Подключите Twitch, чтобы выбрать больше изображений в колесе</div>}
    </div>
  );
};

export default React.memo(TwitchEmotesList);
