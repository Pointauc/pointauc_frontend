import * as React from 'react';
import { ReactElement, ReactNode } from 'react';

const getRandomId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

export interface ClippedProps {
  path: ReactElement | ReactElement[];
  children: ReactNode;
}

class Clipped extends React.PureComponent<ClippedProps> {
  _id = getRandomId();

  render() {
    const { _id } = this;
    const { path, children } = this.props;

    return (
      <g>
        <defs>
          <clipPath id={_id}>{path}</clipPath>
        </defs>

        <g clipPath={`url(#${_id})`}>{children}</g>
      </g>
    );
  }
}

export interface RectClippedProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: ReactNode;
}

export class RectClipped extends React.PureComponent<RectClippedProps> {
  render() {
    const { x, y, width, height, children } = this.props;

    return <Clipped path={<rect x={x} y={y} width={width} height={height} />}>{children}</Clipped>;
  }
}
