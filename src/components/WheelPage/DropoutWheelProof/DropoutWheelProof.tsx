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
      <h2>Доказательство</h2>
      <h3>Как вычисляются размеры в колесе</h3>
      <div>Формула для рассчета инвертированного размера (написано от руки, делать для этого ui долго):</div>
      <img src={DropoutFormula} alt="DropoutFormula" className="dropout_formula" />
      <p>
        Математическое доказательство этой формулы я еще не решил. Это довольно сложно, к тому же я уже забыл всю матешу
        с универа и задачка эта практически непосильна для меня.
      </p>
      <p>
        Изначально находил я эту формулу около интуитивным образом, чтобы получалось нечно похожее на инвертирование для
        простых кейсов. Затем мне помог чатерс dzyaka, который круто шарит в теории вероятностей, он подкорректировал
        мою формулу, чтобы она соответствовала определенным паттернам. В итоге новая формула идеально вписалась в
        имперические тесты скриптом.
      </p>
      <h3>Доказательство скриптом</h3>
      <p>
        Данный скрипт симулирует прокруты колеса на выбывание до последнего победителя и выводит разницу с обычным
        колесом. Вы можете рассчитать шансы и убедиться, что разница стремится к нулю при увеличении итераций.
      </p>
      <p className="warning">
        ВНИМАНИЕ! При нажатии на "Рассчитать шансы" сайт может зависнуть на несколько секунд (зависит от количества
        лотов, количества итераций и вашего пк), просто подождите.
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
      <h2>Философия колеса</h2>
      <p>
        Здесь будут мои рассуждения в свободной форме о проблематике колеса, его идеи, и ответы на некоторые тезисы
        стримеров и чата от которых у меня горит жопа, ну и не только. Желтым будут выделенны обобщенные цитаты.
      </p>
      <p style={{ color: '#e5c938' }}>
        А я хотел сначала крутить выбывание до топ 10, а потом обычное, как мне теперь быть?
      </p>
      <p>
        Подумайте сами, если колесо на выбывание равноценно обычному в начальный момент времени, то оно также равноценно
        ему в любой другой момент для оставшихся лотов. То есть вы В ЛЮБОЙ МОМЕНТ вы можете крутануть обычное колесо
        после колеса на выбывание и это будет то же самое, что просто крутануть обычное колесо один раз.
      </p>
      <p style={{ color: '#e5c938' }}>Колесо на выбывание не должно соответствовать обычному колесу.</p>
      <p>
        Давать преимужество дорогим либо дешевым лотам можно просто возвадя стоимость в степень настраиваемого коэфа
        (коэф наеба). Мне кажется это интересная тема, хоть и чуть усложняет аук для зрителей. (скоро верну эту тему)
      </p>
      <p style={{ color: '#e5c938' }}>Мне больше нравилось прошлое колесо.</p>
      <p>
        Оно конечно более очевидно работает, вот только оно довольно непредсказуемое и шансы на победу в нем не совсем
        равны шансам в обычном колесе. Причем преимущество дается разным лотам (дорогим, дешевым, средним) в зависимости
        от конкретного состояния всех лотов. И это преимущество иногда может драмматически возрастать без дополнительной
        настройки коэфом наеба.
      </p>
      <p>
        Если вы захотите его использовать, то придется рассчитывать шансы и подбирать коэф наеба для вашего кейса и
        ваших целей. Причем некоторые уязвимости старой формулы даже так не исправить. Короче это только для каких-то
        альтернативных эксперементальных ауков.
      </p>
      <p style={{ color: '#e5c938' }}>Тут меньше интриги.</p>
      <p>
        Не уверен, скорее интрига проста работает в обратном направлении. Если раньше в начале вылетали дешевые лоты и
        интрига увеличивалась к концу, то теперь наибольшая интрига вылетят ли дорогие лоты вначале. Возможно в таком
        варианте чуть меньше зрелищности, да, это конечно минус.
      </p>
      <p style={{ color: '#e5c938' }}>Этот формат не так интуитивно понятен.</p>
      <p>
        Да, это главная проблема. Пока что я даже не представляю как сделать колесо на выбывание по-другому сохранив
        шансы обычного колеса, мне даже сложно поверить, что такое возможно.
      </p>
      <p>
        Если же подойти с другой стороны, то можно еще вообще ничего не инвертировать и просто в самом начале выбрать
        победителя обычным рандомом, а колесо на выбывание будет крутиться чисто для вида. Тут даже можно придумать
        скрипт, который будет искусственно создавать интригу, но такое колесо не будет совместимо с любым другим. Да и в
        реализации сложнее.
      </p>
      <p>
        Все же колесо на выбывание в текущем виде вызывает слишком много несправедливых, но закономерных вопросов, а
        доказательство слишком длинное, чтобы объяснять каждому новому зрителю. Но все же я надеюсь оно займет свою
        нишу. Конечно когда-нибудь я его доработаю, скорее всего по второму варианту выше, если соберу больше фидбека
        или мне вдруг придет какая-нибудь крутая идея.
      </p>
      <p style={{ color: '#e5c938' }}>Ты придумал хуиту и всех наебываешь.</p>
      <p>
        С таких комментариев я конечно просто хуею, ну да ладно. Если у вас есть крутые идеи и предложения, пишите мне,
        я их добавлю. Но учтите, что я пилю сайт один в свободное от работы и хобби время, так чем конкретней вы все
        опишите, тем скорее я смогу это реализовать. По опыту скажу, что многие идеи, особенно связанные с колесом на
        выбывание рассыпаются при более подробном рассмотрении. Я не говорю, что идеи плохие, просто зачастую все не так
        очевидно.
      </p>
      <p>
        В любом случае пока это лучшее, что я придумал. Я даже денег за сайт не беру, а такие комментарии немного обидны.
        По большому счету мне конечно поебать, но все же.
      </p>
    </div>
  );
};

export default DropoutWheelProof;
