import React, { FC } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup } from '@material-ui/core';
import { RequestsListInfo } from '../../../../models/requests.model';
import FormInput from '../../../Form/FormInput/FormInput';
import FormSwitch from '../../../Form/FormSwitch/FormSwitch';

interface ListSettingsProps {
  form: UseFormMethods<RequestsListInfo>;
  onSubmit: (data: RequestsListInfo) => void;
  open: boolean;
  toggleOpen: () => void;
  title: string;
  disabled?: boolean;
}

const ListSettingsDialog: FC<ListSettingsProps> = ({ form, toggleOpen, open, onSubmit, title, disabled }) => {
  const { control, handleSubmit } = form;

  return (
    <Dialog open={open} onClose={toggleOpen} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <FormGroup row>
            <FormInput name="name" control={control} label="Название" />
          </FormGroup>
          <FormGroup row>
            <FormInput name="command" control={control} label="Команда чата" />
          </FormGroup>
          <FormGroup row>
            <FormSwitch name="subOnly" control={control} label="Только для подписчиков" />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpen}>Закрыть</Button>
          <Button type="submit" color="primary" disabled={disabled}>
            Применить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ListSettingsDialog;
