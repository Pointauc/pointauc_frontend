import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Typography } from '@material-ui/core';
import audioRoomApi, { AudioRoomUser } from '../../../api/audioRoomApi';
import { useAudioPageStyles } from '../../../constants/theme.constants';
import FormInput from '../../Form/FormInput/FormInput';
import './RoomLoginPage.scss';

interface RoomLoginPageProps {
  setUser: (user: AudioRoomUser) => void;
}

const RoomLoginPage: FC<RoomLoginPageProps> = ({ setUser }) => {
  const classes = useAudioPageStyles();
  const [errorMessage, setErrorMessage] = useState<string>();
  // const [isLoading, setIsLoading] = useState(!!token);
  const { control, handleSubmit, errors } = useForm<AudioRoomUser>();

  const onSubmit = async (user: AudioRoomUser): Promise<void> => {
    try {
      await audioRoomApi.login(user);

      setUser(user);
    } catch (e) {
      setErrorMessage(e.response.data.message);
    }
  };

  return (
    <div className={classes.root}>
      <form onSubmit={handleSubmit(onSubmit)} className="box-container login-page">
        <Typography variant="h4">Вход</Typography>
        {errorMessage && <Typography className="login-page-error">{errorMessage}</Typography>}
        <FormInput
          rules={{ required: 'required' }}
          label="Username"
          name="username"
          control={control}
          errors={errors}
          autoComplete="new-password"
        />
        <FormInput
          type="password"
          rules={{ required: 'required' }}
          label="Password"
          name="password"
          control={control}
          errors={errors}
          autoComplete="new-password"
        />
        <Button className="login-page-submit" type="submit" variant="contained" color="primary">
          войти
        </Button>
      </form>
    </div>
  );
};

export default RoomLoginPage;
