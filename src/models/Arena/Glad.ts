import * as PIXI from 'pixi.js';
import GladView from '../../services/Arena/GladView';

export type GladType = GladView;

export enum StatType {
  atk = 'atk',
  def = 'def',
  agi = 'agi',
}

export enum GladChar {
  Knight = 'Knight',
}

export interface SheetScheme {
  width: number;
  height: number;
  frames: number;
}

export interface AnimationSource {
  sheet: PIXI.SpriteSource;
  scheme: SheetScheme;
}

export type AnimationMap = Record<string, AnimationSource>;
