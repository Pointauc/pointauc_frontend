// eslint-disable-next-line max-classes-per-file
import * as React from 'react';
import { v4 } from 'uuid';
import { ReactNode } from 'react';

export interface ClippedProps {
  path: JSX.Element | JSX.Element[];
  children: ReactNode;
}

class Clipped extends React.PureComponent<ClippedProps> {
  _id = v4();

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
