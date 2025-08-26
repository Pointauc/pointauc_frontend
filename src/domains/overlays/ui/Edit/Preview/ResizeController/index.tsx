import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TransformDto } from '@api/openapi/types.gen';

import { Overlay } from '../../../../model/overlay.types';

import classes from './ResizeController.module.css';

interface ResizeControllerProps {
  children: React.ReactNode;
  overlay: Overlay;
  onTransformUpdate?: (transform: Overlay['transform']) => void;
  containerWidth: number;
  containerHeight: number;
  scaleFactor: number;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'top' | 'bottom' | 'left' | 'right' | 'corner';

interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize';
  resizeDirection?: ResizeDirection;
  startPosition: Position;
  startTransform: {
    origin: Position;
    size: Size;
  };
}

const SNAP_THRESHOLD = 10; // pixels

const ResizeController: FC<ResizeControllerProps> = ({
  children,
  overlay,
  onTransformUpdate,
  containerWidth,
  containerHeight,
  scaleFactor,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [activeGuidelines, setActiveGuidelines] = useState<{
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    centerX?: boolean;
    centerY?: boolean;
  }>({});

  // Get current transform or use defaults
  const currentTransform = overlay.transform || {
    origin: { X: 0, Y: 0 },
    size: { width: containerWidth / 2, height: containerHeight / 2 },
  };

  const { origin, size } = currentTransform;

  // Calculate snap positions
  const snapPositions = useMemo(
    () => ({
      left: 0,
      right: containerWidth,
      centerX: containerWidth / 2,
      top: 0,
      bottom: containerHeight,
      centerY: containerHeight / 2,
    }),
    [containerWidth, containerHeight],
  );

  const getSnappedPosition = useCallback(
    (pos: Position, size: Size) => {
      const snapped = { ...pos };
      const guidelines: typeof activeGuidelines = {};

      // Convert snap threshold to canvas resolution pixels
      const snapThreshold = SNAP_THRESHOLD / scaleFactor;

      // Snap X position
      const right = pos.x + size.width;
      const centerX = pos.x + size.width / 2;

      if (Math.abs(pos.x - snapPositions.left) < snapThreshold) {
        snapped.x = snapPositions.left;
        guidelines.left = true;
      } else if (Math.abs(right - snapPositions.right) < snapThreshold) {
        snapped.x = snapPositions.right - size.width;
        guidelines.right = true;
      } else if (Math.abs(centerX - snapPositions.centerX) < snapThreshold) {
        snapped.x = snapPositions.centerX - size.width / 2;
        guidelines.centerX = true;
      }

      // Snap Y position
      const bottom = pos.y + size.height;
      const centerY = pos.y + size.height / 2;

      if (Math.abs(pos.y - snapPositions.top) < snapThreshold) {
        snapped.y = snapPositions.top;
        guidelines.top = true;
      } else if (Math.abs(bottom - snapPositions.bottom) < snapThreshold) {
        snapped.y = snapPositions.bottom - size.height;
        guidelines.bottom = true;
      } else if (Math.abs(centerY - snapPositions.centerY) < snapThreshold) {
        snapped.y = snapPositions.centerY - size.height / 2;
        guidelines.centerY = true;
      }

      setActiveGuidelines(guidelines);

      return snapped;
    },
    [snapPositions, scaleFactor],
  );

  const constrainToContainer = useCallback(
    (pos: Position, size: Size) => {
      return {
        x: Math.max(0, Math.min(pos.x, containerWidth - size.width)),
        y: Math.max(0, Math.min(pos.y, containerHeight - size.height)),
      };
    },
    [containerWidth, containerHeight],
  );

  const constrainSize = useCallback(
    (size: Size, origin: Position) => {
      const maxWidth = containerWidth - origin.x;
      const maxHeight = containerHeight - origin.y;

      return {
        width: Math.max(50, Math.min(size.width, maxWidth)), // Minimum 50px
        height: Math.max(50, Math.min(size.height, maxHeight)), // Minimum 50px
      };
    },
    [containerWidth, containerHeight],
  );

  const updateTransform = useCallback(
    (newOrigin: Position, newSize: Size) => {
      const constrainedPosition = constrainToContainer(newOrigin, newSize);
      const constrainedSize = constrainSize(newSize, constrainedPosition);
      const snappedPosition = getSnappedPosition(constrainedPosition, constrainedSize);

      const newTransform: TransformDto = {
        origin: { X: snappedPosition.x, Y: snappedPosition.y },
        size: { width: constrainedSize.width, height: constrainedSize.height },
      };

      onTransformUpdate?.(newTransform);
    },
    [constrainToContainer, constrainSize, getSnappedPosition, onTransformUpdate],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, dragType: 'move' | 'resize', resizeDirection?: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({
        isDragging: true,
        dragType,
        resizeDirection,
        startPosition: { x: e.clientX, y: e.clientY },
        startTransform: {
          origin: { x: origin.X, y: origin.Y },
          size: { width: size.width, height: size.height },
        },
      });

      setShowGuidelines(true);
    },
    [origin, size],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState) return;

      // Convert screen pixel movement to canvas resolution pixels
      const rawDeltaX = e.clientX - dragState.startPosition.x;
      const rawDeltaY = e.clientY - dragState.startPosition.y;
      const deltaX = rawDeltaX / scaleFactor;
      const deltaY = rawDeltaY / scaleFactor;

      if (dragState.dragType === 'move') {
        const newOrigin = {
          x: dragState.startTransform.origin.x + deltaX,
          y: dragState.startTransform.origin.y + deltaY,
        };
        updateTransform(newOrigin, dragState.startTransform.size);
      } else if (dragState.dragType === 'resize' && dragState.resizeDirection) {
        const newOrigin = { ...dragState.startTransform.origin };
        const newSize = { ...dragState.startTransform.size };

        switch (dragState.resizeDirection) {
          case 'top':
            newOrigin.y = dragState.startTransform.origin.y + deltaY;
            newSize.height = dragState.startTransform.size.height - deltaY;
            break;
          case 'bottom':
            newSize.height = dragState.startTransform.size.height + deltaY;
            break;
          case 'left':
            newOrigin.x = dragState.startTransform.origin.x + deltaX;
            newSize.width = dragState.startTransform.size.width - deltaX;
            break;
          case 'right':
            newSize.width = dragState.startTransform.size.width + deltaX;
            break;
          case 'corner':
            newSize.width = dragState.startTransform.size.width + deltaX;
            newSize.height = dragState.startTransform.size.height + deltaY;
            break;
        }

        updateTransform(newOrigin, newSize);
      }
    },
    [dragState, updateTransform, scaleFactor],
  );

  const handleMouseUp = useCallback(() => {
    if (dragState) {
      setDragState(null);
      setShowGuidelines(false);
      setActiveGuidelines({});
    }
  }, [dragState]);

  useEffect(() => {
    if (dragState) {
      // console.log('dragState', dragState);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  return (
    <div className={classes.resizeController}>
      {/* Guidelines */}
      {showGuidelines && (
        <div className={classes.guidelines}>
          <div
            className={`${classes.guideline} ${classes.guidelineVertical} ${
              !activeGuidelines.left ? classes.hidden : ''
            }`}
            style={{ left: snapPositions.left }}
          />
          <div
            className={`${classes.guideline} ${classes.guidelineVertical} ${
              !activeGuidelines.right ? classes.hidden : ''
            }`}
            style={{ left: snapPositions.right }}
          />
          <div
            className={`${classes.guideline} ${classes.guidelineVertical} ${
              !activeGuidelines.centerX ? classes.hidden : ''
            }`}
            style={{ left: snapPositions.centerX }}
          />
          <div
            className={`${classes.guideline} ${classes.guidelineHorizontal} ${
              !activeGuidelines.top ? classes.hidden : ''
            }`}
            style={{ top: snapPositions.top }}
          />
          <div
            className={`${classes.guideline} ${classes.guidelineHorizontal} ${
              !activeGuidelines.bottom ? classes.hidden : ''
            }`}
            style={{ top: snapPositions.bottom }}
          />
          <div
            className={`${classes.guideline} ${classes.guidelineHorizontal} ${
              !activeGuidelines.centerY ? classes.hidden : ''
            }`}
            style={{ top: snapPositions.centerY }}
          />
        </div>
      )}

      {/* Resizable wrapper */}
      <div
        ref={wrapperRef}
        className={`${classes.resizableWrapper} ${dragState?.dragType === 'move' ? classes.dragging : ''}`}
        style={{
          left: origin.X,
          top: origin.Y,
          width: size.width,
          height: size.height,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Content */}
        <div className={classes.resizableContent}>{children}</div>

        {/* Resize handles */}
        <div
          className={`${classes.resizeHandle} ${classes.resizeHandleTop} ${
            dragState?.resizeDirection === 'top' ? classes.dragging : ''
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'resize', 'top')}
        />
        <div
          className={`${classes.resizeHandle} ${classes.resizeHandleBottom} ${
            dragState?.resizeDirection === 'bottom' ? classes.dragging : ''
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom')}
        />
        <div
          className={`${classes.resizeHandle} ${classes.resizeHandleLeft} ${
            dragState?.resizeDirection === 'left' ? classes.dragging : ''
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'resize', 'left')}
        />
        <div
          className={`${classes.resizeHandle} ${classes.resizeHandleRight} ${
            dragState?.resizeDirection === 'right' ? classes.dragging : ''
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'resize', 'right')}
        />
        <div
          className={`${classes.resizeHandle} ${classes.resizeHandleCorner} ${
            dragState?.resizeDirection === 'corner' ? classes.dragging : ''
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'resize', 'corner')}
        />
      </div>
    </div>
  );
};

export default ResizeController;
