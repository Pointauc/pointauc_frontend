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

const initialCurve = 'M0,0,C0.104,0.204';
// const initialPoints: Point[] = [{ x: 0.448, y: 0.908 }];
class SpinPaceService {
  config: RandomPaceConfig;
  path = initialCurve;
  points: Point[] = [];
  constructor({ valueRandomZone, randomOffset, ...config }: RandomPaceConfig, rotation: number, spinTime: number) {
    this.config = { ...config, valueRandomZone: valueRandomZone / rotation, randomOffset: randomOffset / spinTime };
  }

  getInitialCurvePoint = (progress: number): number => 1 - (1 - progress) ** 2;

  addStartPoint = (): void => {
    const { randomOffset } = this.config;
    const x = 1 - randomOffset;
    const y = this.getInitialCurvePoint(x);

    this.points.push({ x, y });

    this.path = `${this.path},${1 - randomOffset - (1 - randomOffset) / 2},${y - (1 - y) * 2},${x},${y}`;
  };

  addPoint = (): void => {
    const { allowBackStep, valueRandomZone, valueDisabledZone } = this.config;
    const availableSize = valueRandomZone - valueDisabledZone * valueRandomZone;
    let position;

    if (allowBackStep) {
      const randomValue = Math.random() * availableSize * 2;

      position =
        randomValue > availableSize
          ? randomValue - valueRandomZone - availableSize
          : randomValue + valueDisabledZone * valueRandomZone;
    } else {
      position = Math.random() * availableSize + valueDisabledZone * valueRandomZone;
    }
    const { y } = this.points[this.points.length - 1];

    this.points.push({ x: 1, y: position + y });
  };

  getCurve = (previousPoint: Point, nextPoint: Point): string => {
    const xOffset = (nextPoint.x - previousPoint.x) / 2;
    const yOffset = (nextPoint.y - previousPoint.x) / 8;
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
