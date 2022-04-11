import React, { ChangeEvent, FC, Key, useCallback, useState } from 'react';
import './DropoutWheelProof.scss';
import { useSelector } from 'react-redux';
import { Button, Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import { ColDef, XGrid } from '@material-ui/x-grid';
import RadioButtonGroup, { Option } from '../../RadioButtonGroup/RadioButtonGroup';
import PredictionService, { SlotChanceDifference } from '../../../services/PredictionService';
import { RootState } from '../../../reducers';
import { createRandomSlots } from '../../../reducers/Slots/Slots';
import { percentsFormatter } from '../../../utils/common.utils';
import DropoutFormula from '../../../assets/img/dropout_formula.png';

enum SlotsPresetType {
  Random,
  Current,
}

const SLOT_PRESETS_OPTIONS: Option[] = [
  { key: SlotsPresetType.Current, value: 'текущие лоты' },
  { key: SlotsPresetType.Random, value: 'рандомные лоты' },
];

const columns: ColDef[] = [
  {
    headerName: 'Название',
    field: 'name',
    sortable: true,
    flex: 0.8,
  },
  {
    headerName: 'Сумма',
    field: 'amount',
    sortable: true,
    flex: 0.4,
  },
  {
    headerName: 'Обычное колесо',
    field: 'originalChance',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Выбывание',
    field: 'dropoutChance',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Разница в шансах',
    field: 'chanceDifference',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Победы',
    field: 'winsCount',
    sortable: true,
    flex: 0.4,
  },
];

const DropoutWheelProof: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [slotsPresetType, setSlotsPresetType] = useState<Key>(SlotsPresetType.Current);
  const [iterations, setIterations] = useState<number>(5000);
  const [chanceDifference, setChanceDifference] = useState<SlotChanceDifference[]>([]);
  const [preserveLogs, setPreserveLogs] = useState<boolean>(false);

  const predictChances = useCallback(() => {
    console.clear();

    const safeIterations = preserveLogs ? Math.min(30, iterations) : iterations;
    const slotsToPredict = slotsPresetType === SlotsPresetType.Current ? slots : createRandomSlots(20, 2000, 10);
    const predictionService = new PredictionService(slotsToPredict, preserveLogs);
    const difference = predictionService.researchDifference(safeIterations);

    setChanceDifference(difference);
  }, [iterations, preserveLogs, slots, slotsPresetType]);

  const handleIterationsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIterations(Number(e.target.value));
  }, []);

  const handlePreserveLogsChange = useCallback((e, checked: boolean) => {
    setPreserveLogs(checked);
    setIterations(checked ? 5 : 5000);
  }, []);

  return (
    <div className="dropout-wheel-proof">
      <h2>Кратко</h2>
      <p>
        Конечный шанс на победу у лота ТАКОЙ ЖЕ как если бы вы крутили обычное колесо. Но есть неочевидный нюанс, чем
        больше лотов в колесе, тем более равные шансы на выбывание будет у лотов, и чем меньше лотов осталось, тем
        меньше шансов выбыть у дорогих лотов. Это бывает очень не очевидно для зрителей, но именно с такой инверссией
        это колесо полностью честное (все равно как крутить обычное колесо по шансам).
      </p>
      <p>
        Используйте по своему усмотрению, потому что зрители, которые не в курсе, могут возмутиться таким форматом, но
        такой же правильной инверсии с другим форматом я не знаю.
      </p>
      <h2>Доказательство</h2>
      <h3>Как вычисляются размеры в колесе</h3>
      <div>Формула для расчета инвертированного размера (написано от руки):</div>
      <img src={DropoutFormula} alt="DropoutFormula" className="dropout_formula" />
      <p>
        Математическое доказательство этой формулы я не делал, потому что в этом кейсе это довольно сложно. С подбором
        формулы мне помогал чатерс dzyaka, который здорово разбирается в теории вероятностей и математике. Я тестировал
        эту формулу симуляцией прокрутов и она идеально соответствует шансам в обычном колесе.
      </p>
      <h3>Доказательство скриптом</h3>
      <p>
        Данный скрипт симулирует прокруты колеса на выбывание до последнего победителя и выводит разницу с обычным
        колесом. Вы можете рассчитать шансы и убедиться, что разница стремится к нулю при увеличении итераций.
      </p>
      <p className="warning">
        ВНИМАНИЕ! При нажатии на "Рассчитать шансы" сайт может зависнуть на несколько секунд (зависит от количества
        лотов, количества итераций и вашего пк), просто подождите. Но лучше сохраните лоты на всякий, если у вас 50+
        позиций)
      </p>
      <p className="warning">Максимальное количество итераций при включенных подробных логах - 30.</p>
      <div className="row">
        <RadioButtonGroup
          options={SLOT_PRESETS_OPTIONS}
          activeKey={slotsPresetType}
          onChangeActive={setSlotsPresetType}
        />
        <TextField
          className="iteration-input"
          variant="outlined"
          margin="dense"
          label="кол-во итераций"
          onChange={handleIterationsChange}
          value={iterations}
        />
        <Button variant="contained" color="primary" onClick={predictChances}>
          рассчитать шансы
        </Button>
      </div>
      <FormControlLabel
        control={<Checkbox checked={preserveLogs} onChange={handlePreserveLogsChange} color="primary" />}
        label="Подробные логи итераций"
        className="wheel-controls-checkbox"
      />
      {!!chanceDifference.length && preserveLogs && <p>Чтобы посмотреть логи нажмите F12 -&gt; вкладка "console"</p>}
      <div style={{ height: '50vh' }} className="history-table">
        <XGrid
          rows={chanceDifference}
          columns={columns}
          pagination
          rowHeight={35}
          pageSize={30}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          disableSelectionOnClick
          disableColumnMenu
        />
      </div>
    </div>
  );
};

export default DropoutWheelProof;
