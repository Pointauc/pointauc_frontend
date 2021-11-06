import React, { FC } from 'react';
import { Typography } from '@material-ui/core';

interface ConnectedUsersProps {
  users: string[];
}

const ConnectedUsers: FC<ConnectedUsersProps> = ({ users }) => {
  return (
    <div className="box-container">
      {users.map((username) => (
        <Typography key={username}>{username}</Typography>
      ))}
    </div>
  );
};

export default ConnectedUsers;
