import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { AgGridEvent, ColDef, ValueGetterParams } from 'ag-grid-community';
import { RootState } from '../../../reducers';
import './PurchaseHistory.scss';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import { FORMAT } from '../../../constants/format.constants';
import { COLORS } from '../../../constants/color.constants';
import { PurchaseStatusEnum } from '../../../reducers/Purchases/Purchases';

const PurchaseHistory: React.FC = () => {
  const { history } = useSelector((root: RootState) => root.purchases);

  const getTime = (params: ValueGetterParams): string =>
    moment(params.data.purchase.timestamp).format(FORMAT.DATE.time);

  const getStatusCellStyles = (params: ValueGetterParams): CSSProperties => ({
    color: COLORS.PURCHASE_STATUS[params.data.status as PurchaseStatusEnum],
  });

  const columnDefs: ColDef[] = [
    {
      headerName: 'Время',
      field: 'purchase.timestamp',
      sortable: true,
      valueGetter: getTime,
    },
    {
      headerName: 'Пользователь',
      field: 'purchase.username',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: { buttons: ['reset'], closeOnApply: true, suppressAndOrCondition: true },
    },
    {
      headerName: 'Сообщение',
      field: 'purchase.message',
      suppressSizeToFit: true,
      filter: 'agTextColumnFilter',
      filterParams: { buttons: ['reset'], closeOnApply: true, suppressAndOrCondition: true },
    },
    {
      headerName: 'Стоимость',
      field: 'purchase.cost',
      sortable: true,
      filter: 'agNumberColumnFilter',
      filterParams: { buttons: ['reset'], closeOnApply: true, suppressAndOrCondition: true },
    },
    { headerName: 'Статус', field: 'status', cellStyle: getStatusCellStyles },
  ];

  const resizeTable = ({ api, columnApi }: AgGridEvent): void => {
    columnApi.autoSizeAllColumns();
    api.sizeColumnsToFit();
  };

  return (
    <div className="ag-theme-alpine-dark" id="history-table">
      <AgGridReact
        onGridReady={resizeTable}
        onPaginationChanged={resizeTable}
        columnDefs={columnDefs}
        rowData={history}
        suppressCellSelection
        enableCellTextSelection
        suppressMenuHide
        paginationPageSize={10}
        pagination
        domLayout="autoHeight"
      />
    </div>
  );
};

export default PurchaseHistory;
