import React, { FC, ReactElement, useMemo } from 'react';
import { ColDef, XGrid } from '@material-ui/x-grid';
import { Button } from '@material-ui/core';
import classNames from 'classnames';
import { UserRequest } from '../../../models/requests.model';
import './RequestsTable.scss';

interface RequestsTableProps {
  requests: UserRequest[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

const RequestsTable: FC<RequestsTableProps> = ({ requests, loading, onDelete }) => {
  const columns: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Никнейм',
        field: 'username',
        sortable: true,
        filterable: true,
        flex: 1,
      },
      {
        headerName: 'Заказ',
        field: 'request',
        sortable: true,
        filterable: true,
        flex: 2,
      },
      {
        width: 150,
        field: 'id',
        // eslint-disable-next-line react/display-name
        renderCell: ({ value }): ReactElement => {
          const onClick = (): void => onDelete(value as string);

          return (
            <Button
              onClick={onClick}
              variant="outlined"
              color="secondary"
              style={{ fontSize: 12, padding: '2px 10px' }}
            >
              удалить
            </Button>
          );
        },
      },
    ],
    [onDelete],
  );

  return (
    <div className={classNames('history-table', { empty: !requests.length && !loading })}>
      <XGrid
        columns={columns}
        rows={requests}
        autoHeight
        pagination
        pageSize={25}
        rowsPerPageOptions={[25]}
        disableSelectionOnClick
        rowHeight={38}
        loading={loading}
      />
    </div>
  );
};

export default RequestsTable;
