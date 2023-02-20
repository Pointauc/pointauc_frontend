import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CellClassRules,
  CellValue,
  ColDef,
  SelectionChangeParams,
  ValueGetterParams,
  XGrid,
} from '@material-ui/x-grid';
import dayjs from 'dayjs';
import { Button } from '@material-ui/core';
import { RootState } from '../../../reducers';
import './PurchaseHistory.scss';
import { FORMAT } from '../../../constants/format.constants';
import { PurchaseStatusEnum } from '../../../models/purchase';
import { updateRedemption } from '../../../api/twitchApi';
import { RedemptionStatus } from '../../../models/redemption.model';

interface SlotsMap {
  [key: string]: string | null;
}

const PurchaseHistory: React.FC = () => {
  const { history } = useSelector((root: RootState) => root.purchases);
  const { slots } = useSelector((root: RootState) => root.slots);
  const [selection, setSelection] = useState<SelectionChangeParams>();

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
    <div className="history-table">
      <Button variant="outlined" color="primary" onClick={handleRefund}>
        Вернуть выбранные награды
      </Button>
      <XGrid
        checkboxSelection
        onSelectionChange={setSelection}
        rows={history}
        columns={columns}
        autoHeight
        pagination
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20, 50]}
        disableSelectionOnClick
      />
    </div>
  );
};

export default PurchaseHistory;
