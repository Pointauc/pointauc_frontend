export interface WheelItem {
  name: string;
  id: string | number;
  color: string;
  amount: number;
}

export interface WheelItemWithMetadata extends WheelItem {
  originalAmount?: number;
}

export interface WheelItemWithAngle extends WheelItem {
  startAngle: number;
  endAngle: number;
}
