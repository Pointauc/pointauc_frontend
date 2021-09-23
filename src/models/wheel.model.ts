import { Key } from 'react';

export interface WheelItem {
  name: string;
  id: Key;
  color: string;
  amount?: number;
}

export interface WheelItemWithAngle extends WheelItem {
  startAngle: number;
  endAngle: number;
}
