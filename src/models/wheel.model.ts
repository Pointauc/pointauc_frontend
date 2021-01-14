export interface WheelItem {
  name: string;
  id: string;
  color: string;
  size?: number;
}

export interface WheelItemWithAngle extends WheelItem {
  startAngle: number;
  endAngle: number;
}
