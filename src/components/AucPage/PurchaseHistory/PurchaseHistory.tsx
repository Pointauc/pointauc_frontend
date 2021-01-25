import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CellClassRules, CellValue, ColDef, ValueGetterParams, XGrid } from '@material-ui/x-grid';
import dayjs from 'dayjs';
import { RootState } from '../../../reducers';
import './PurchaseHistory.scss';
import { FORMAT } from '../../../constants/format.constants';
import { PurchaseStatusEnum } from '../../../reducers/Purchases/Purchases';

interface SlotsMap {
  [key: string]: string | null;
}

const PurchaseHistory: React.FC = () => {
  const { history } = useSelector((root: RootState) => root.purchases);
  const { slots } = useSelector((root: RootState) => root.slots);

  const slotsMap = useMemo(
    () => slots.reduce<SlotsMap>((acc, { id, name }) => ({ ...acc, [id.toString()]: name }), {}),
    [slots],
  );

  const getTime = (params: ValueGetterParams): CellValue => dayjs(params.value?.toString()).format(FORMAT.DATE.time);

  const statusCellClassRules: CellClassRules = {
    status: true,
    deleted: ({ value }: ValueGetterParams) => value === PurchaseStatusEnum.Deleted,
    processed: ({ value }: ValueGetterParams) => value === PurchaseStatusEnum.Processed,
  };

  const getTargetName = (params: ValueGetterParams): CellValue =>
    params.value && (slotsMap[params.value.toString()] || '');

  const columns: ColDef[] = [
    {
      headerName: 'Время',
      field: 'timestamp',
      sortable: true,
      valueGetter: getTime,
      width: 110,
    },
    {
      headerName: 'Пользователь',
      field: 'username',
      sortable: true,
      filterable: true,
      flex: 0.6,
    },
    {
      headerName: 'Сообщение',
      field: 'message',
      filterable: true,
      flex: 1,
    },
    {
      headerName: 'Стоимость',
      field: 'cost',
      sortable: true,
      filterable: true,
      width: 140,
    },
    {
      headerName: 'Добавлен к',
      field: 'target',
      sortable: true,
      filterable: true,
      valueGetter: getTargetName,
      flex: 1,
    },
    { headerName: 'Статус', field: 'status', cellClassRules: statusCellClassRules, width: 110 },
  ];

  return (
    <div className="history-table">
      <XGrid
        rows={history}
        columns={columns}
        autoHeight
        pagination
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
        disableSelectionOnClick
      />
    </div>
  );
};

export default PurchaseHistory;
