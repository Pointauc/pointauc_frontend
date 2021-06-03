export interface RandomPaceConfig {
  points: number; // кол-во перегибов
  allowBackStep: boolean; // возможность крутиться в обратную сторону
  valueRandomZone: number; // высота рандома 0-1
  xRandomZone: number; // процент зоны в котором будет рандомится точка по x 0-1
  valueDisabledZone: number; // процент зона, в которой не будут генериться точки 0-1
  randomOffset: number; // зона от правого края, в которой начинается рандом 0-0.5
}

export interface Point {
  x: number;
  y: number;
}

const initialCurve = 'M0,0,C0.083,0.294,0.182,0.718,0.448,0.908,0.579,1.001';
// const initialPoints: Point[] = [{ x: 0.448, y: 0.908 }];

class SpinPaceService {
  config: RandomPaceConfig;
  path = initialCurve;
  points: Point[] = [];
  constructor({ valueRandomZone, randomOffset, ...config }: RandomPaceConfig, rotation: number, spinTime: number) {
    this.config = { ...config, valueRandomZone: valueRandomZone / rotation, randomOffset: randomOffset / spinTime };
  }

  getInitialCurvePoint = (progress: number): number => 1 - (1 - progress) ** 4;

  addStartPoint = (): void => {
    const { randomOffset } = this.config;
    const x = 1 - randomOffset;
    const y = this.getInitialCurvePoint(x);

    this.points.push({ x, y });

    this.path = `${this.path},${1 - randomOffset - (1 - randomOffset - 0.448) / 3},${y},${x},${y}`;
  };

  addPoint = (): void => {
    const { allowBackStep, valueRandomZone, valueDisabledZone } = this.config;
    const availableSize = valueRandomZone - valueDisabledZone;
    let position;

    if (allowBackStep) {
      const randomValue = Math.random() * availableSize * 2;

      position = randomValue > availableSize ? randomValue - availableSize * 2 : randomValue + availableSize;
    } else {
      position = Math.random() * availableSize + valueDisabledZone;
    }
    const { y } = this.points[this.points.length - 1];

    this.points.push({ x: 1, y: position + y });
  };

  getCurve = (previousPoint: Point, nextPoint: Point): string => {
    const xOffset = (nextPoint.x - previousPoint.x) / 2;
    const yOffset = (nextPoint.y - previousPoint.x) / 6;
    const getCurvePoint = ({ x, y }: Point, isPreviousPoint?: boolean): string =>
      `${(x + (isPreviousPoint ? xOffset : -xOffset)).toFixed(4)},${(
        y + (isPreviousPoint ? yOffset : -yOffset)
      ).toFixed(4)}`;

    return `${getCurvePoint(previousPoint, true)},${getCurvePoint(nextPoint)},${nextPoint.x.toFixed(
      4,
    )},${nextPoint.y.toFixed(4)}`;
  };

  createPath = (): string => {
    this.points = [];

    this.addStartPoint();
    this.addPoint();

    return this.points
      .slice(1)
      .reduce<string>(
        (accum, nextPoint, index) => `${accum},${this.getCurve(this.points[index], nextPoint)}`,
        this.path,
      );
  };
}

export default SpinPaceService;
