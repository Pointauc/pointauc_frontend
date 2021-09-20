import React, { FC } from 'react';
import { ColDef, XGrid } from '@material-ui/x-grid';
import { Request } from '../../../models/requests.model';

interface RequestsTableProps {
  requests: Request[];
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

const RequestsTable: FC<RequestsTableProps> = ({ requests }) => {
  return (
    <div className="history-table">
      <XGrid columns={columns} rows={requests} />
    </div>
  );
};

export default RequestsTable;
