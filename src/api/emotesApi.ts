// @ts-ignore
import { Emote, Emote as BaseEmote } from '@kozjar/twitch-emoticons';
import axios from 'axios';

import ENDPOINTS from '../constants/api.constants';

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace SevenTV {
  export interface EmoteFile {
    name: string;
  }

  export interface EmoteHost {
    url: string;
    files: EmoteFile[];
  }

  export interface EmoteData {
    id: string;
    name: string;
    data: {
      id: string;
      host: EmoteHost;
    };
  }

  export interface Response {
    emote_set: {
      emotes: EmoteData[];
    };
  }

  export const toBaseEmote = ({ data, id }: EmoteData): Emote => ({
    min: 1,
    max: Number(data.host.files[data.host.files.length - 1].name[0]) || 1,
    id,
    toLink: (size: number): string => {
      const postfix = data.host.files.find(({ name }) => name.startsWith(String(size)))?.name;

      return `https:${data.host.url}/${postfix}`;
    },
  });
}

export const getSevenTVEmotes = async (user: string): Promise<BaseEmote> => {
  const { data } = await axios.get<SevenTV.Response>(`${ENDPOINTS.EMOTES.SEVEN_TV}/${user}`);

  return data.emote_set.emotes.map(SevenTV.toBaseEmote);
};
