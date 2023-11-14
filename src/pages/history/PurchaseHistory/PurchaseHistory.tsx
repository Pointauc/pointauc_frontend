import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import classNames from 'classnames';

import { RootState } from '@reducers';
import { FORMAT } from '@constants/format.constants.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { updateRedemption } from '@api/twitchApi.ts';
import { RedemptionStatus } from '@models/redemption.model.ts';
import './PurchaseHistory.scss';

interface SlotsMap {
  [key: string]: string | null;
}

const PurchaseHistory: React.FC = () => {
  const { history } = useSelector((root: RootState) => root.purchases);
  const { slots } = useSelector((root: RootState) => root.slots);
  const [selection, setSelection] = useState<any>();

  const slotsMap = useMemo(
    () => slots.reduce<SlotsMap>((acc, { id, name }) => ({ ...acc, [id.toString()]: name }), {}),
    [slots],
  );

  const getTime = (params: any): any => dayjs(params.value?.toString()).format(FORMAT.DATE.time);

  const statusCellClassRules = ({ value }: any) =>
    classNames({
      status: true,
      deleted: value === PurchaseStatusEnum.Deleted,
      processed: value === PurchaseStatusEnum.Processed,
    });

  const getTargetName = (params: any): any => params.value && (slotsMap[String(params.value)] || '');

  const columns: GridColDef[] = [
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
    { headerName: 'Статус', field: 'status', cellClassName: statusCellClassRules, width: 110 },
  ];

  const handleRefund = useCallback(() => {
    history.forEach(({ id, rewardId, isDonation, target }) => {
      if (selection?.rowIds.includes(id) && !isDonation && target && rewardId) {
        updateRedemption({
          status: RedemptionStatus.Canceled,
          redemptionId: id,
          rewardId,
        });
      }
    });
  }, [history, selection]);

  return (
    <div className='history-table'>
      <Button variant='outlined' color='primary' onClick={handleRefund}>
        Вернуть выбранные награды
      </Button>
      <DataGrid
        checkboxSelection
        onRowSelectionModelChange={setSelection}
        rows={history}
        columns={columns}
        autoHeight
        pagination
        pageSizeOptions={[5, 10, 20, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default PurchaseHistory;
