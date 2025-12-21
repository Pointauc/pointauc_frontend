import { Box, Paper, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useState } from 'react';

import type { ParticipantDto } from '@api/openapi/types.gen';

import './WinnerSelectionVisualizer.css';

interface WinnerSelectionVisualizerProps {
  participants: ParticipantDto[];
  randomNumber: number;
  totalAmount: number;
  winnerIndex: number;
}

/**
 * Generates distinct colors for neighboring segments
 */
const generateSegmentColors = (count: number): string[] => {
  const baseColors = [
    '#4c6ef5', // blue
    '#7950f2', // violet
    '#f06595', // pink
    '#20c997', // teal
    '#ff922b', // orange
    '#74c0fc', // light blue
    '#b197fc', // light violet
    '#ffa8a8', // light red
    '#51cf66', // green
    '#ffd43b', // yellow
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Visualizes the winner selection algorithm using a horizontal bar chart
 * with color-coded segments representing each participant's winning chance
 */
const WinnerSelectionVisualizer = ({
  participants,
  randomNumber,
  totalAmount,
  winnerIndex,
}: WinnerSelectionVisualizerProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = useMantineTheme();

  const segmentColors = generateSegmentColors(participants.length);

  // Random number is already normalized to [0, 1) range, convert to percentage
  const randomNumberPosition = randomNumber * 100;

  return (
    <Box className='winner-selection-visualizer'>
      <Paper bg='dark.7' p='md' radius='md' pos='relative'>
        {/* Bar container */}
        <Box pos='relative' style={{ height: '60px', width: '100%' }}>
          {/* Segments */}
          <Box
            style={{
              display: 'flex',
              height: '100%',
              width: '100%',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {participants.map((participant, index) => {
              const percentage = (participant.amount / totalAmount) * 100;
              const isWinner = index === winnerIndex;
              const isHovered = index === hoveredIndex;

              return (
                <Tooltip
                  key={index}
                  label={
                    <Box>
                      <Text size='sm' fw={600}>
                        {participant.name || 'Anonymous'}
                      </Text>
                      <Text size='xs' c='dimmed'>
                        Amount: {participant.amount}
                      </Text>
                      <Text size='xs' c='dimmed'>
                        Chance: {percentage.toFixed(2)}%
                      </Text>
                    </Box>
                  }
                  position='top'
                  withArrow
                  transitionProps={{ duration: 200 }}
                >
                  <Box
                    className={`segment ${isWinner ? 'winner-segment' : ''} ${isHovered ? 'hovered-segment' : ''}`}
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: segmentColors[index],
                      cursor: 'pointer',
                      transition: 'filter 0.2s ease',
                      filter: isHovered ? 'brightness(1.3)' : 'brightness(1)',
                      borderRight: index < participants.length - 1 ? '1px solid rgba(0, 0, 0, 0.2)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </Tooltip>
              );
            })}
          </Box>

          {/* Random number indicator line */}
          <Box
            className='random-indicator'
            style={{
              position: 'absolute',
              left: `${randomNumberPosition}%`,
              top: '-10px',
              bottom: '-10px',
              width: '3px',
              backgroundColor: '#ff4444',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {/* Arrow at top */}
            <Box
              style={{
                position: 'absolute',
                top: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid #ff4444',
              }}
            />
            {/* Arrow at bottom */}
            <Box
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '8px solid #ff4444',
              }}
            />
          </Box>
        </Box>

        {/* Legend */}
        <Box mt='lg'>
          <Text size='xs' c='dimmed' ta='center'>
            Random number: {randomNumber.toFixed(6)} ({randomNumberPosition.toFixed(2)}%)
          </Text>
        </Box>
      </Paper>
    </Box>
  );
};

export default WinnerSelectionVisualizer;
