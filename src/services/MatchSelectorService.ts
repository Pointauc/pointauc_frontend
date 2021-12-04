class MatchSelectorService {
  selectLast = <T>(data: T[], count: number): T[] => data.slice(data.length - count, data.length);
}

export default new MatchSelectorService();
