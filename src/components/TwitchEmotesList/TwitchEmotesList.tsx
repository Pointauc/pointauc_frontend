import { FC, useCallback, useEffect, useState, memo } from 'react';
import { CircularProgress, IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
// @ts-ignore
import { EmoteFetcher, Collection, Emote } from '@kozjar/twitch-emoticons';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import { getSevenTVEmotes } from '@api/emotesApi.ts';
import './TwitchEmotesList..scss';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const fetcher = new EmoteFetcher();

interface TwitchEmotesListProps {
  setActiveEmote: (emote: string) => void;
  onEmotesLoad?: (emotes: Emote[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const flattenCollection = (collection: Collection<string, Emote>): Emote[] => Array.from<Emote>(collection.values());

const emoteLists = ['default', 'twitch', '7tv', 'bttv', 'ffz'];

const TwitchEmotesList: FC<TwitchEmotesListProps> = ({ setActiveEmote, onEmotesLoad }) => {
  const { t } = useTranslation();
  const { userId } = useSelector((root: RootState) => root.user);
  const [userEmotes, setUserEmotes] = useState<(Emote[] | null)[]>();

  const updateEmotes = useCallback(async () => {
    let loadedEmotes: Emote[];
    const emotesPromises = [getSevenTVEmotes('883803697')];

    if (userId) {
      emotesPromises.push(
        getSevenTVEmotes(userId),
        fetcher.fetchTwitchEmotes(Number(userId)).then(flattenCollection),
        fetcher.fetchBTTVEmotes(Number(userId)).then(flattenCollection),
        fetcher.fetchFFZEmotes(Number(userId)).then(flattenCollection),
      );
    }
    loadedEmotes = await Promise.all(emotesPromises.map((promise) => promise.catch(() => null)));
    loadedEmotes = loadedEmotes.filter((value) => value != null);

    setUserEmotes(loadedEmotes);

    if (onEmotesLoad) {
      const flatEmotes = loadedEmotes.reduce((accum, emotes) => (emotes ? [...accum, ...emotes] : accum), []);
      onEmotesLoad(flatEmotes);
    }
  }, [userId]);

  useEffect(() => {
    updateEmotes();
  }, [updateEmotes]);

  const crateEmoteList = useCallback(
    (emotes: Emote[] | null, id: string) => {
      if (!emotes) {
        return null;
      }

      return (
        <div className='emotes-group' key={id}>
          {emotes.map((emote: Emote) => {
            const { min = 0, max = 2 } = emote as any;
            const handleClick = (): void => setActiveEmote(emote.toLink(max));

            return (
              <IconButton key={emote.id} className='emote-button' onClick={handleClick} size='large'>
                <img alt='emote' src={emote.toLink(min)} />
              </IconButton>
            );
          })}
        </div>
      );
    },
    [setActiveEmote],
  );

  return (
    <div className='emotes-container'>
      {userEmotes ? (
        <>{userEmotes.map((emotes, index) => crateEmoteList(emotes, emoteLists[index]))}</>
      ) : (
        <CircularProgress className='emotes-loading' />
      )}
      {!userId && <div className='emote-hint'>{t('wheel.connectTwitchForMoreEmotes')}</div>}
    </div>
  );
};

export default memo(TwitchEmotesList);
