import FilePlayer from './FilePlayer';
import YoutubePlayer from './YoutubePlayer';
import { PlayerProps } from './types';

const PlayerFactory = (props: PlayerProps<Wheel.SoundtrackSource>) => {
  const { source, ref, ...rest } = props;
  return (
    <>
      {source.type === 'file' && <FilePlayer source={source} ref={ref} {...rest} />}
      {source.type === 'youtube' && <YoutubePlayer source={source} ref={ref} {...rest} />}
    </>
  );
};

export default PlayerFactory;
