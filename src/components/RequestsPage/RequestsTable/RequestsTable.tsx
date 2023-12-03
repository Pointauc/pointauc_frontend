import { FC, ReactElement, useMemo } from 'react';
import { Button } from '@mui/material';
import classNames from 'classnames';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';

import { UserRequest } from '@models/requests.model.ts';

import './RequestsTable.scss';

interface RequestsTableProps {
  requests: UserRequest[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

const RequestsTable: FC<RequestsTableProps> = ({ requests, loading, onDelete }) => {
  const columns: GridColDef[] = useMemo(
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
        renderCell: ({ value }: GridRenderCellParams): ReactElement => {
          const onClick = (): void => onDelete(value);

          return (
            <Button
              onClick={onClick}
              variant='outlined'
              color='secondary'
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
      <DataGrid
        columns={columns}
        rows={requests}
        autoHeight
        pagination
        pageSizeOptions={[25]}
        disableRowSelectionOnClick
        rowHeight={38}
        loading={loading}
      />
    </div>
  );
};

export default RequestsTable;
