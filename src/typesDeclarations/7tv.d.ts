declare module '7tv' {
  export interface SevenTVEmote {
    height: number[];
    width: number[];
    name: string;
    id: string;
  }

  export interface SevenTVApi {
    fetchUserEmotes: (username: string) => Promise<SevenTVEmote[]>;
  }

  export default function (): SevenTVApi;
}
