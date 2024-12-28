import { Key, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import { PACE_PRESETS, WheelFormat } from '@constants/wheel.ts';
import { WheelItem } from '@models/wheel.model.ts';
import { getTotalSize, random } from '@utils/common.utils.ts';
import { getRandomNumber } from '@api/randomApi.ts';
import withLoading from '@decorators/withLoading';
import { DropoutVariant, WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import WheelSettings from '@components/RandomWheel/WheelSettings/WheelSettings.tsx';
import { WheelContextProvider } from '@components/RandomWheel/WheelSettings/WheelContext.tsx';
import WheelComponent from '@components/RandomWheel/WheelSettings/Wheel';
import useWheelResolver from '@components/RandomWheel/hooks/useWheelResolver.ts';
import wheelUtils from '@components/RandomWheel/wheelUtils.ts';
import array from '@utils/dataType/array.ts';
import ItemsPreview from '@components/RandomWheel/ItemsPreview';
import './RandomWheel.scss';

export interface SettingElements {
  mode: boolean;
  split: boolean;
  randomPace: boolean;
  randomOrg: boolean;
  import: boolean;
  preview: boolean;
}

const initialAvailableSettings: SettingElements = {
  mode: true,
  split: true,
  randomPace: true,
  randomOrg: true,
  import: true,
  preview: true,
};

interface RandomWheelProps<TWheelItem extends WheelItem = WheelItem> {
  items: TWheelItem[];
  deleteItem?: (id: Key) => void;
  initialSpinTime?: number;
  onWin?: (winner: TWheelItem) => void;
  isShuffle?: boolean;
  elements?: Partial<SettingElements>;
  children?: ReactNode;
}

const defaultSettings: Wheel.Settings = {
  spinTime: 20,
  randomSpinConfig: { min: 20, max: 100 },
  randomSpinEnabled: false,

  useRandomOrg: false,
  format: WheelFormat.Default,
  paceConfig: PACE_PRESETS.suddenFinal,
  split: 1,
  coreImage: localStorage.getItem('wheelEmote'),

  maxDepth: null,
  depthRestriction: null,

  dropoutVariant: DropoutVariant.New,
};
const savedSettings = JSON.parse(localStorage.getItem('wheelSettings') ?? '{}');
const initialSettings = { ...defaultSettings, ...savedSettings };

const RandomWheel = <TWheelItem extends WheelItem = WheelItem>({
  items: _itemsFromProps,
  deleteItem,
  onWin,
  isShuffle = true,
  elements: elementsFromProps,
  children,
}: RandomWheelProps<TWheelItem>): ReactElement => {
  const [itemsFromProps, setItemsFromProps] = useState<WheelItem[]>(_itemsFromProps);
  const elements = useMemo(() => ({ ...initialAvailableSettings, ...elementsFromProps }), [elementsFromProps]);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const wheelController = useRef<WheelController | null>(null);
  const { handleSubmit } = useFormContext<Wheel.Settings>();

  const formValues = useWatch<Wheel.Settings>();
  const { randomSpinEnabled, randomSpinConfig, spinTime } = formValues;
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });

  useEffect(() => {
    const { split, ...settings } = formValues;
    localStorage.setItem('wheelSettings', JSON.stringify(settings));
  }, [formValues]);

  useEffect(() => {
    wheelController.current?.resetPosition();
    wheelController.current?.clearWinner();
  }, [format, dropoutVariant]);

  const { items, init, onSpinStart, extraSettings, renderSubmitButton, onSpinEnd, content } = useWheelResolver({
    format,
    dropoutVariant,
    controller: wheelController,
  });

  const filteredItems = useMemo(
    () =>
      getTotalSize(itemsFromProps)
        ? itemsFromProps.filter(({ amount }) => amount)
        : itemsFromProps.map((item) => ({ ...item, amount: 1 })),
    [itemsFromProps],
  );

  useEffect(() => {
    init?.(filteredItems);
  }, [init, filteredItems]);

  const getSeed = useCallback(async () => {
    const totalSize = getTotalSize(items);
    const size = totalSize > 5000 ? totalSize : totalSize + 10000;
    const seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, size).catch(() => undefined);

    return seed && seed / size;
  }, [items]);

  const onSpinClick = useCallback(
    async ({ useRandomOrg }: Wheel.Settings) => {
      const spinConfig = onSpinStart?.();
      const { min, max } = randomSpinConfig!;
      const duration = randomSpinEnabled ? random.getInt(min!, max!) : spinTime;
      const winner = await wheelController.current?.spin({
        seed: useRandomOrg ? await getSeed() : undefined,
        duration: duration,
        ...spinConfig,
      });
      await onSpinEnd?.(winner);
      winner && onWin?.(winner as TWheelItem);
    },
    [getSeed, onSpinEnd, onSpinStart, onWin, randomSpinConfig, randomSpinEnabled, spinTime],
  );

  const split = useWatch<Wheel.Settings>({ name: 'split' });
  const maxSize = useMemo(() => Math.max(...items.map<number>(({ amount }) => Number(amount))), [items]);
  const splittedItems = useMemo(() => {
    if (split === 1) {
      return items;
    }

    const newItems = wheelUtils.splitItems(items, split * maxSize);
    return newItems.length ? array.distributeEvenly(newItems) : [];
  }, [items, maxSize, split]);

  return (
    <WheelContextProvider controller={wheelController} changeInitialItems={setItemsFromProps}>
      <form className='wheel-content' onSubmit={handleSubmit(onSpinClick)}>
        {!content && elements.preview && <ItemsPreview allItems={filteredItems} activeItems={items} />}
        {content && <div className='wheel-content-negative-space' />}
        <WheelComponent
          finalItems={splittedItems}
          shuffle={split != 1 ? false : isShuffle}
          deleteItem={deleteItem}
          controller={wheelController}
        />
        <div className={classNames('wheel-info-wrapper', { shrink: content })}>
          <div className={classNames('wheel-controls')}>
            <WheelSettings
              direction={content ? 'row' : 'column'}
              isLoadingSeed={isLoadingSeed}
              controls={elements}
              renderSubmitButton={renderSubmitButton}
            >
              <>
                {extraSettings}
                {children}
              </>
            </WheelSettings>
          </div>
          {content}
        </div>
      </form>
    </WheelContextProvider>
  );
};

const Provider = <TWheelItem extends WheelItem = WheelItem>(props: RandomWheelProps<TWheelItem>): ReactElement => {
  const initial = useMemo(
    () => ({ ...initialSettings, spinTime: props.initialSpinTime || initialSettings.spinTime }),
    [props.initialSpinTime],
  );
  const form = useForm<Wheel.Settings>({ defaultValues: initial });

  return (
    <FormProvider {...form}>
      <RandomWheel {...props} />
    </FormProvider>
  );
};

export default Provider;
