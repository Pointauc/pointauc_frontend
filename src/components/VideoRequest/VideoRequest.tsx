import React, { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Link, Paper } from '@material-ui/core';
import { RootState } from '../../reducers';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import LoadingButton from '../LoadingButton/LoadingButton';
import './VideoRequest.scss';
import { splitByUrls } from '../../utils/url.utils';

const maxVotesToSkip = 6;

const VideoRequest: React.FC = () => {
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const [currentRequest, setCurrentRequest] = useState<string>();
  const [isSkipButtonLoading, setIsSkipButtonLoading] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [skipVotes, setSkipVotes] = useState<number>(0);

  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', ({ data }: MessageEvent) => {
        const { type, request } = JSON.parse(data);

        switch (type) {
          case MESSAGE_TYPES.NEW_REQUEST:
            setCurrentRequest(request);
            setIsVoting(false);
            setIsSkipButtonLoading(false);
            setSkipVotes(0);
            break;

          case MESSAGE_TYPES.VOTE_SKIP:
            setSkipVotes((prevVotes) => prevVotes + 1);
            break;

          case MESSAGE_TYPES.VOTE_ANTI_SKIP:
            setSkipVotes((prevVotes) => prevVotes - 1);
            break;

          default:
            break;
        }
      });
    }
  }, [webSocket]);

  const startVoting = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.START_VOTING }));
      setIsVoting(true);
    }
  };

  const skipRequest = (): void => {
    if (webSocket) {
      setIsSkipButtonLoading(true);
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.SKIP_REQUEST }));
      setIsVoting(true);
    }
  };

  const wrapUrl = (url: string): ReactElement => (
    <Link href={url} target="_blank">
      {url}
    </Link>
  );
  const wrapText = (text: string): ReactElement => <span>{text}</span>;

  const formattedRequest = useMemo<ReactNode>(() => {
    if (!currentRequest) return '';

    return splitByUrls(currentRequest).map((text, index) =>
      index % 2 === 1 ? wrapUrl(text) : wrapText(text),
    );
  }, [currentRequest]);

  return (
    <div>
      {currentRequest ? (
        <div>
          <div className="request">
            <Paper variant="outlined" className="request-message">
              {formattedRequest}
            </Paper>
            {isVoting ? (
              <LoadingButton
                isLoading={isSkipButtonLoading}
                variant="outlined"
                color="secondary"
                onClick={skipRequest}
              >
                Скипнуть
              </LoadingButton>
            ) : (
              <Button variant="contained" color="primary" onClick={startVoting}>
                Начать ГОЛОСОВАНИЕ
              </Button>
            )}
          </div>
          {`Пропусков ${skipVotes}/${maxVotesToSkip}`}
        </div>
      ) : (
        <p>Ни одно видео еще не заказано</p>
      )}
    </div>
  );
};

export default VideoRequest;
