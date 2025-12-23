import { FC, useEffect, useRef } from 'react';

import classes from './AudioTimeline.module.css';

interface WaveformCanvasProps {
  waveform: number[];
  width: number;
  height: number;
}

/**
 * Canvas-based waveform visualization
 * Displays audio amplitude as vertical bars
 */
const WaveformCanvas: FC<WaveformCanvasProps> = ({ waveform, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barCount = waveform.length;
    const barWidth = width / barCount;
    const halfHeight = height / 2;

    // Get Mantine dark-3 color from CSS variable
    const computedStyle = getComputedStyle(canvas);
    const fillColor = computedStyle.getPropertyValue('--mantine-color-dark-4').trim();
    ctx.fillStyle = fillColor || '#5c5f66'; // Fallback to dark-3 hex value

    waveform.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * halfHeight;

      // Draw bar from center
      ctx.fillRect(x, halfHeight - barHeight / 2, barWidth - 1, barHeight);
    });
  }, [waveform, width, height]);

  return <canvas ref={canvasRef} className={classes.waveformCanvas} />;
};

export default WaveformCanvas;
