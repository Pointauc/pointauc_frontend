import { PlayerProps, PlayerRef } from './types';

type FilePlayerProps = PlayerProps<Wheel.SoundtrackSourceFile>;

const FilePlayer = ({ source, ref }: FilePlayerProps) => {
  return (
    <div>
      <h1>FilePlayer</h1>
    </div>
  );
};

export default FilePlayer;
