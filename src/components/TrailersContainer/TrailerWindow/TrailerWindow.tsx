import { ChangeEvent, KeyboardEvent, FC, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Group, Kbd, Stack, Text, Title } from '@mantine/core';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import { Trailer } from '@models/extraWindows.ts';
import { closeTrailer } from '@reducers/ExtraWindows/ExtraWindows.ts';
import withLoading from '@decorators/withLoading';
import { searchYoutubeVideos } from '@api/youtubeApi.ts';
import { VideoSnippet } from '@models/youtube.ts';
import { Size } from '@models/common.model.ts';
import YoutubePlayer from '@components/YoutubePlayer/YoutubePlayer';
import { timedFunction } from '@utils/dataType/function.utils';

import VideoPreview from '../VideoPreview/VideoPreview';
import ResizablePanel from '../../ResizablePanel/ResizablePanel';

import './TrailerWindow.scss';

import styles from './TrailerWindow.module.css';

const initialSize = { width: 1000, height: 650 };

const TrailerWindow: FC<Trailer> = ({ id, title: windowTitle }) => {
  const dispatch = useDispatch();
  const [searchRequest, setSearchRequest] = useState<string>(`${windowTitle} trailer`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState<Size>(initialSize);
  const container = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleCloseTrailer = useCallback(() => {
    dispatch(closeTrailer(id));
  }, [dispatch, id]);

  const handleRequestChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchRequest(value);
  }, []);

  const searchVideos = useCallback(async () => {
    const videosData = await searchYoutubeVideos(searchRequest);

    setVideos(videosData ?? []);
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

  useEffect(() => {
    onSubmit();
  }, []);

  useEffect(() => {
    if (container.current) {
      const updateSize = timedFunction(() => {
        if (!container.current) return;
        const { width, height } = container.current.getBoundingClientRect();
        setWindowSize({ width, height });
      }, 50);

      const observer = new ResizeObserver((entries) => {
        updateSize();
      });

      observer.observe(container.current);

      return () => observer.disconnect();
    }
  }, []);

  return (
    <ResizablePanel
      initialSize={initialSize}
      onClose={handleCloseTrailer}
      contentRef={container}
      title={
        <Group align='center' gap='xs'>
          {currentVideo && (
            <IconButton onClick={() => setCurrentVideo(null)} title='Назад' size='large'>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Title order={4}>{`Трейлер: ${windowTitle}`}</Title>
        </Group>
      }
      contentClassName={currentVideo ? styles.panelContentWithYoutube : undefined}
    >
      <div
        style={{ position: 'absolute', top: 0, left: 0, ...(currentVideo ? windowSize : { width: 0, height: 0 }) }}
        className='youtube-container'
      >
        <YoutubePlayer videoId={currentVideo} width={windowSize.width} height={windowSize.height} />
      </div>
      {!currentVideo && (
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
            <Kbd className={styles.searchFormKbd}>Enter</Kbd>
          </div>
          <div className='trailers-list'>
            {isLoading ? (
              <div className='trailer-loading'>
                <CircularProgress className='trailer-loading-spinner' />
              </div>
            ) : (
              <Stack gap='xs'>
                {videos.map((video) => (
                  <VideoPreview {...video} onSelect={setCurrentVideo} key={video.id.videoId} />
                ))}
                {videos.length === 0 && <Text>{t('trailerWindow.noResults')}</Text>}
              </Stack>
            )}
          </div>
        </div>
      )}
    </ResizablePanel>
  );
};

export default TrailerWindow;
