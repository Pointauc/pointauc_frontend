import React, { FC } from 'react';
import { ColDef, XGrid } from '@material-ui/x-grid';
import classNames from 'classnames';
import { UserRequest } from '../../../models/requests.model';
import './RequestsTable.scss';

interface RequestsTableProps {
  requests: UserRequest[];
  loading?: boolean;
}

const columns: ColDef[] = [
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
];

const RequestsTable: FC<RequestsTableProps> = ({ requests, loading }) => {
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
