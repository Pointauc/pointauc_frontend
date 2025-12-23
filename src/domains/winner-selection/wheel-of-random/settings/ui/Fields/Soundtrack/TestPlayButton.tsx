import { FC, useState } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

interface TestPlayButtonProps {
  onPlay: () => void;
  onStop: () => void;
}

/**
 * Button to test audio playback with current settings
 */
const TestPlayButton: FC<TestPlayButtonProps> = ({ onPlay, onStop }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (isPlaying) {
      onStop();
      setIsPlaying(false);
    } else {
      onPlay();
      setIsPlaying(true);
      // Auto-stop after some time (optional)
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    }
  };

  return (
    <Button
      variant="light"
      leftSection={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
      onClick={handleClick}
    >
      {isPlaying ? t('common.stop') : t('wheel.soundtrack.actions.testPlay')}
    </Button>
  );
};

export default TestPlayButton;

