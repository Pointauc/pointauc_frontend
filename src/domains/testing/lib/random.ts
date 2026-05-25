const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomItem = <T>(items: T[]): T => items[getRandomInt(0, items.length - 1)];

export const getRandomWords = (count: number): string => {
  return Array.from({ length: count }, () => {
    const length = getRandomInt(4, 10);

    return Array.from({ length }, () => ALPHABET[getRandomInt(0, ALPHABET.length - 1)]).join('');
  }).join(' ');
};
