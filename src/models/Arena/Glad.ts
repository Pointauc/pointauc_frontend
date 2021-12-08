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

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  width: number;
  height: number;
}

export enum Team {
  Red,
  Blue,
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Ellipse extends Vector2 {
  rx: number;
  ry: number;
}

export interface TickerType {
  deltaMS: number;
  add: (callback: (dt: number) => void) => void;
  remove: (callback: (dt: number) => void) => void;
}
