import { CloneElement } from 'rdk';
import React, { FC, ReactElement, createRef, useCallback, useEffect, useState } from 'react';
import { ChartDataTypes } from '../../data';
import { LinearAxisLine, LinearAxisLineProps } from './LinearAxisLine';
import { LinearAxisTickSeries, LinearAxisTickSeriesProps } from './LinearAxisTickSeries';

export interface LinearAxisDimensionChanged {
  height?: number;
  width?: number;
}

export interface LinearAxisProps {
  height?: number;
  width?: number;
  domain?: ChartDataTypes[];
  scaled?: boolean;
  roundDomains?: boolean;
  type?: 'value' | 'time' | 'category' | 'duration';
  position?: 'start' | 'end' | 'center';
  tickSeries?: ReactElement<LinearAxisTickSeriesProps, typeof LinearAxisTickSeries>;
  axisLine?: ReactElement<LinearAxisLineProps, typeof LinearAxisLine> | null;
  scale?: any;
  orientation?: 'horizontal' | 'vertical';
  onDimensionsChange?: (event: LinearAxisDimensionChanged) => void;
}

interface LinearAxisState {
  height?: number;
  width?: number;
}

export const LinearAxis: FC<Partial<LinearAxisProps>> = props => {
  const {
    position,
    tickSeries,
    axisLine,
    height,
    width,
    scale,
    orientation,
    onDimensionsChange
  } = props;

  const containerRef = createRef<SVGGElement>();
  const [dimensions, setDimensions] = useState<LinearAxisState>({ height: height, width: width });

  const updateDimensions = useCallback(() => {
    const shouldOffset = position !== 'center';

    let height;
    let width;
    if (shouldOffset) {
      const dims = containerRef.current!.getBoundingClientRect();
      width = Math.floor(dims.width);
      height = Math.floor(dims.height);
    }

    if (orientation === 'vertical') {
      if (dimensions.width !== width) {
        setDimensions({ ...dimensions, width: width });
        onDimensionsChange({ width });
      }
    } else {
      if (dimensions.height !== height) {
        setDimensions({ ...dimensions, height: height });
        onDimensionsChange({ height });
      }
    }
  }, [containerRef, dimensions, onDimensionsChange, orientation, position]);

  useEffect(() => {
    updateDimensions();
  }, [updateDimensions, height, width, scale]);

  function getPosition() {
    let translateY = 0;
    let translateX = 0;

    if (position === 'end' && orientation === 'horizontal') {
      translateY = height;
    } else if (position === 'center' && orientation === 'horizontal') {
      translateY = height / 2;
    } else if (position === 'end' && orientation === 'vertical') {
      translateX = width;
    } else if (position === 'center' && orientation === 'vertical') {
      translateX = width / 2;
    }

    return { translateX, translateY };
  }

  const { translateX, translateY } = getPosition();

  return (
    <g transform={`translate(${translateX}, ${translateY})`} ref={containerRef}>
      {axisLine && (
        <CloneElement<LinearAxisLineProps>
          element={axisLine}
          height={height}
          width={width}
          scale={scale}
          orientation={orientation}
        />
      )}
      {(tickSeries.props.line || tickSeries.props.label) && (
        <CloneElement<LinearAxisTickSeriesProps>
          element={tickSeries}
          height={height}
          width={width}
          scale={scale}
          orientation={orientation}
          axis={props}
        />
      )}
    </g>
  );
};

LinearAxis.defaultProps = {
  scaled: false,
  roundDomains: false,
  axisLine: <LinearAxisLine />,
  onDimensionsChange: () => undefined
};
