import { Loader, Text } from '@mantine/core';
import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// @ts-ignore
import { Collection, Emote, EmoteFetcher } from '@kozjar/twitch-emoticons';
import { useTranslation } from 'react-i18next';

import { getSevenTVEmotes } from '@api/emotesApi.ts';
import styles from '@components/TwitchEmotesList/TwitchEmotesList.module.css';
import { RootState } from '@reducers';

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
              <button key={emote.id} onClick={handleClick} type='button' className={styles.emoteButton}>
                <img alt='emote' src={emote.toLink(min)} />
              </button>
            );
          })}
        </div>
      );
    },
    [setActiveEmote],
  );

  return (
    <div className={styles.container}>
      {userEmotes ? <>{userEmotes.map((emotes, index) => crateEmoteList(emotes, emoteLists[index]))}</> : <Loader />}
      {!userId && (
        <Text c='dimmed' m='lg' ta='center'>
          {t('wheel.connectTwitchForMoreEmotes')}
        </Text>
      )}
    </div>
  );
};

export default TwitchEmotesList;
