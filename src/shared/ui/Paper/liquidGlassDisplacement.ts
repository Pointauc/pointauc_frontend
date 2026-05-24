import type { PaperGlassOptions, PaperGlassSurface } from './liquidGlass';

interface DisplacementVector {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const smoothStep = (value: number) => value * value * (3 - 2 * value);

const smootherStep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

const mix = (from: number, to: number, amount: number) => from * (1 - amount) + to * amount;

const getCircleHeight = (distanceRatio: number) => {
  return 1 - Math.sqrt(Math.max(0, 1 - distanceRatio * distanceRatio));
};

const getSquircleHeight = (distanceRatio: number) => {
  return 1 - Math.pow(Math.max(0, 1 - Math.pow(distanceRatio, 4)), 0.25);
};

const getConcaveHeight = (distanceRatio: number) => {
  return smoothStep(distanceRatio);
};

const getSurfaceHeight = (surface: PaperGlassSurface, distanceRatio: number) => {
  const progress = clamp(distanceRatio, 0, 1);

  if (surface === 'convexCircle') {
    return getCircleHeight(progress);
  }

  if (surface === 'convexSquircle') {
    return getSquircleHeight(progress);
  }

  if (surface === 'concave') {
    return getConcaveHeight(progress);
  }

  return mix(getSquircleHeight(progress), 1 - getConcaveHeight(1 - progress), smootherStep(progress));
};

const getSurfaceDerivative = (surface: PaperGlassSurface, distanceRatio: number) => {
  const delta = 0.001;
  const previous = getSurfaceHeight(surface, clamp(distanceRatio - delta, 0, 1));
  const next = getSurfaceHeight(surface, clamp(distanceRatio + delta, 0, 1));

  return (next - previous) / (2 * delta);
};

const getSurfaceDirection = (surface: PaperGlassSurface, distanceRatio: number) => {
  if (surface === 'concave') {
    return -1;
  }

  if (surface === 'lip' && distanceRatio > 0.56) {
    return -0.55;
  }

  return 1;
};

const getBorderDirection = (x: number, y: number, bezelRatio: number): DisplacementVector => {
  let vectorX = 0;
  let vectorY = 0;

  if (x < bezelRatio) {
    vectorX = 1;
  } else if (x > 1 - bezelRatio) {
    vectorX = -1;
  }

  if (y < bezelRatio) {
    vectorY = 1;
  } else if (y > 1 - bezelRatio) {
    vectorY = -1;
  }

  if (vectorX === 0 && vectorY === 0) {
    const distances = [
      { value: x, vector: { x: 1, y: 0 } },
      { value: 1 - x, vector: { x: -1, y: 0 } },
      { value: y, vector: { x: 0, y: 1 } },
      { value: 1 - y, vector: { x: 0, y: -1 } },
    ];
    const closest = distances.reduce((closestDistance, distance) =>
      distance.value < closestDistance.value ? distance : closestDistance,
    );

    return closest.vector;
  }

  const length = Math.hypot(vectorX, vectorY);

  return {
    x: vectorX / length,
    y: vectorY / length,
  };
};

const createDisplacementVectors = (options: PaperGlassOptions) => {
  const resolution = Math.round(clamp(options.glassDisplacementMapResolution, 24, 96));
  const bezelRatio = clamp(options.glassBezelWidth / 100, 0.04, 0.36);
  const vectors: DisplacementVector[] = [];
  let maximumMagnitude = 0;

  for (let row = 0; row < resolution; row += 1) {
    for (let column = 0; column < resolution; column += 1) {
      const x = column / (resolution - 1);
      const y = row / (resolution - 1);
      const distanceFromBorder = Math.min(x, 1 - x, y, 1 - y);

      if (distanceFromBorder > bezelRatio) {
        vectors.push({ x: 0, y: 0 });
        continue;
      }

      const distanceRatio = clamp(distanceFromBorder / bezelRatio, 0, 1);
      const derivative = getSurfaceDerivative(options.glassSurface, distanceRatio);
      const direction = getBorderDirection(x, y, bezelRatio);
      const surfaceDirection = getSurfaceDirection(options.glassSurface, distanceRatio);
      const strength = derivative * options.glassThickness * surfaceDirection;
      const vector = {
        x: direction.x * strength,
        y: direction.y * strength,
      };

      vectors.push(vector);
      maximumMagnitude = Math.max(maximumMagnitude, Math.hypot(vector.x, vector.y));
    }
  }

  return {
    resolution,
    vectors,
    maximumMagnitude: maximumMagnitude || 1,
  };
};

export const createLiquidGlassDisplacementMap = (options: PaperGlassOptions) => {
  const { resolution, vectors, maximumMagnitude } = createDisplacementVectors(options);
  const rects = vectors
    .map((vector, index) => {
      const column = index % resolution;
      const row = Math.floor(index / resolution);
      const red = Math.round(clamp(128 + (vector.x / maximumMagnitude) * 127, 0, 255));
      const green = Math.round(clamp(128 + (vector.y / maximumMagnitude) * 127, 0, 255));

      return `<rect x="${column}" y="${row}" width="1" height="1" fill="rgb(${red},${green},128)" />`;
    })
    .join('');

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${resolution} ${resolution}"`,
    ` width="${resolution}" height="${resolution}" shape-rendering="crispEdges">`,
    rects,
    '</svg>',
  ].join('');

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
