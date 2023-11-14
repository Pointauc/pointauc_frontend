import { ChangeEvent, KeyboardEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { Trailer } from '@models/extraWindows.ts';
import { closeTrailer } from '@reducers/ExtraWindows/ExtraWindows.ts';
import withLoading from '@decorators/withLoading';
import { searchYoutubeVideos } from '@api/youtubeApi.ts';
import { VideoSnippet } from '@models/youtube.ts';
import { Size } from '@models/common.model.ts';
import YoutubePlayer from '@components/YoutubePlayer/YoutubePlayer';

import VideoPreview from '../VideoPreview/VideoPreview';
import ResizablePanel from '../../ResizablePanel/ResizablePanel';
import './TrailerWindow.scss';

const initialSize = { width: 1000, height: 650 };

const TrailerWindow: FC<Trailer> = ({ id, title: windowTitle }) => {
  const dispatch = useDispatch();
  const [searchRequest, setSearchRequest] = useState<string>(`${windowTitle} trailer`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string>();
  const [windowSize, setWindowSize] = useState<Size>(initialSize);

  const handleCloseTrailer = useCallback(() => {
    dispatch(closeTrailer(id));
  }, [dispatch, id]);

  const handleRequestChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchRequest(value);
  }, []);

  const searchVideos = useCallback(async () => {
    const videosData = await searchYoutubeVideos(searchRequest);

    setVideos(videosData);
  }, [searchRequest]);

  const onSubmit = useMemo(() => withLoading(setIsLoading, searchVideos), [searchVideos]);

  const handleKeyPress = useCallback(
    ({ key }: KeyboardEvent<HTMLDivElement>) => {
      if (key === 'Enter') {
        onSubmit();
      }
    },
    [onSubmit],
  );

  const playerOptions = useMemo(
    () => ({ width: windowSize.width - 2, height: windowSize.height - 50 }),
    [windowSize.height, windowSize.width],
  );

  useEffect(() => {
    onSubmit();
  }, []);

  return (
    <ResizablePanel initialSize={initialSize} onClose={handleCloseTrailer} title={windowTitle} onResize={setWindowSize}>
      {currentVideo ? (
        <div style={{ position: 'absolute', top: 0, left: 0 }} className='youtube-container'>
          <YoutubePlayer videoId={currentVideo} {...playerOptions} />
        </div>
      ) : (
        <div className='trailer'>
          <div className='search-form'>
            <IconButton type='submit' className='search-form-icon' onClick={onSubmit} size='large'>
              <SearchIcon />
            </IconButton>
            <InputBase
              placeholder='Поиск YouTube'
              className='search-form-input'
              value={searchRequest}
              onChange={handleRequestChange}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className='trailers-list'>
            {isLoading ? (
              <div className='trailer-loading'>
                <CircularProgress className='trailer-loading-spinner' />
              </div>
            ) : (
              videos.map((video) => <VideoPreview {...video} onSelect={setCurrentVideo} key={video.id.videoId} />)
            )}
          </div>
        </div>
      )}
    </ResizablePanel>
  );
};

export default TrailerWindow;
