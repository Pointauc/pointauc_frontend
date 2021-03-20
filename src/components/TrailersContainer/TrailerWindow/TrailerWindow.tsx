import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, IconButton, InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Trailer } from '../../../models/extraWindows';
import ResizablePanel from '../../ResizablePanel/ResizablePanel';
import { closeTrailer } from '../../../reducers/ExtraWindows/ExtraWindows';
import './TrailerWindow.scss';
import withLoading from '../../../decorators/withLoading';
import { searchYoutubeVideos } from '../../../api/youtubeApi';
import { VideoSnippet } from '../../../models/youtube';
import VideoPreview from '../VideoPreview/VideoPreview';
import { Size } from '../../../models/common.model';
import YoutubePlayer from '../../YoutubePlayer/YoutubePlayer';

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

  const handleRequestChange = useCallback(({ target: { value } }) => {
    setSearchRequest(value);
  }, []);

  const searchVideos = useCallback(async () => {
    const videosData = await searchYoutubeVideos(searchRequest);

    setVideos(videosData);
  }, [searchRequest]);

  const onSubmit = useMemo(() => withLoading(setIsLoading, searchVideos), [searchVideos]);

  const handleKeyPress = useCallback(
    ({ key }) => {
      if (key === 'Enter') {
        onSubmit();
      }
    },
    [onSubmit],
  );

  const playerOptions = useMemo(() => ({ width: windowSize.width - 2, height: windowSize.height - 50 }), [
    windowSize.height,
    windowSize.width,
  ]);

  useEffect(() => {
    onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResizablePanel initialSize={initialSize} onClose={handleCloseTrailer} title={windowTitle} onResize={setWindowSize}>
      {currentVideo ? (
        <div style={{ position: 'absolute', top: 0, left: 0 }} className="youtube-container">
          <YoutubePlayer videoId={currentVideo} {...playerOptions} />
        </div>
      ) : (
        <div className="trailer">
          <div className="search-form">
            <IconButton type="submit" className="search-form-icon" onClick={onSubmit}>
              <SearchIcon />
            </IconButton>
            <InputBase
              placeholder="Поиск YouTube"
              className="search-form-input"
              value={searchRequest}
              onChange={handleRequestChange}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="trailers-list">
            {isLoading ? (
              <div className="trailer-loading">
                <CircularProgress className="trailer-loading-spinner" />
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
