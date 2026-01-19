export interface WheelItem {
  name: string;
  id: string | number;
  color: string;
  amount: number;
  isFavorite: boolean;
}

export interface WheelItemWithMetadata extends WheelItem {
  originalAmount?: number;
}

export interface WheelItemWithAngle extends WheelItem {
  startAngle: number;
  endAngle: number;
}
