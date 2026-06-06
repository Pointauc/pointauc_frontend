import { getLiquidGlassFilterScale } from './liquidGlass';

import type { PaperGlassOptions } from './liquidGlass';

interface LiquidGlassFilterProps {
  filterId: string;
  displacementMap: string;
  glassOptions: PaperGlassOptions;
}

const LiquidGlassFilter = ({ filterId, displacementMap, glassOptions }: LiquidGlassFilterProps) => {
  const displacementScale = getLiquidGlassFilterScale(glassOptions);
  const refractionBlur = Math.max(glassOptions.glassBlurLevel * 0.3, 0);
  const specularExponent = Math.max(glassOptions.glassSpecularSaturation * 4, 1);

  return (
    <svg aria-hidden='true' className='pointer-events-none absolute h-0 w-0 overflow-hidden' focusable='false'>
      <filter id={filterId} colorInterpolationFilters='sRGB' x='0%' y='0%' width='100%' height='100%'>
        <feImage
          href={displacementMap}
          x='0'
          y='0'
          width='100%'
          height='100%'
          preserveAspectRatio='none'
          result='paper-displacement-map'
        />
        <feDisplacementMap
          in='SourceGraphic'
          in2='paper-displacement-map'
          scale={displacementScale}
          xChannelSelector='R'
          yChannelSelector='G'
          result='paper-refracted'
        />
        <feGaussianBlur in='paper-refracted' stdDeviation={refractionBlur} result='paper-soft-refraction' />
        <feSpecularLighting
          in='paper-displacement-map'
          surfaceScale={Math.max(glassOptions.glassThickness, 0.1)}
          specularConstant={glassOptions.glassSpecularOpacity}
          specularExponent={specularExponent}
          lightingColor='#ffffff'
          result='paper-specular'
        >
          <feDistantLight azimuth={glassOptions.glassSpecularAngle} elevation='55' />
        </feSpecularLighting>
        <feColorMatrix
          in='paper-specular'
          type='saturate'
          values={String(glassOptions.glassSpecularSaturation)}
          result='paper-specular-saturated'
        />
        <feComponentTransfer in='paper-specular-saturated' result='paper-specular-opacity'>
          <feFuncA type='linear' slope={glassOptions.glassSpecularOpacity} />
        </feComponentTransfer>
        <feBlend in='paper-soft-refraction' in2='paper-specular-opacity' mode='screen' />
      </filter>
    </svg>
  );
};

export default LiquidGlassFilter;
