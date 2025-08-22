import classNames from 'classnames';
import {
  Key,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormProvider, UseFormReturn, useForm, useFormContext, useWatch } from 'react-hook-form';

import { getRandomNumber } from '@api/randomApi.ts';
import { DropoutVariant, SpinParams, WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import WheelFlexboxAutosizer from '@components/BaseWheel/FlexboxAutosizer';
import ItemsPreview from '@components/RandomWheel/ItemsPreview';
import WheelComponent from '@components/RandomWheel/WheelSettings/Wheel';
import { WheelContextProvider } from '@components/RandomWheel/WheelSettings/WheelContext.tsx';
import WheelSettings from '@components/RandomWheel/WheelSettings/WheelSettings.tsx';
import useWheelResolver from '@components/RandomWheel/hooks/useWheelResolver.ts';
import wheelUtils from '@components/RandomWheel/wheelUtils.ts';
import { PACE_PRESETS, WheelFormat } from '@constants/wheel.ts';
import withLoading from '@decorators/withLoading';
import { calculateRandomSpinDistance } from '@features/wheel/lib/geometry';
import { WheelItem } from '@models/wheel.model.ts';
import { getTotalSize, random, shuffle } from '@utils/common.utils.ts';
import array from '@utils/dataType/array.ts';
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
  initialSpinTime?: number;
  shouldShuffle?: boolean;
  elements?: Partial<SettingElements>;
  children?: ReactNode;
  wheelRef?: React.RefObject<RandomWheelController>;
  // callbacks
  deleteItem?: (id: Key) => void;
  onWin?: (winner: TWheelItem) => void;
  onWheelItemsChanged?: (items: TWheelItem[]) => void;
  onSpinStart?: (params: SpinParams) => void;
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

export interface RandomWheelController {
  setItems: (items: WheelItem[]) => void;
  spin?: WheelController['spin'];
}

const RandomWheel = <TWheelItem extends WheelItem = WheelItem>({
  items: _itemsFromProps,
  deleteItem,
  onWin,
  onWheelItemsChanged,
  onSpinStart,
  shouldShuffle = true,
  elements: elementsFromProps,
  children,
  wheelRef,
}: RandomWheelProps<TWheelItem>): ReactElement => {
  const [itemsFromProps, setItemsFromProps] = useState<WheelItem[]>(_itemsFromProps);
  const elements = useMemo(() => ({ ...initialAvailableSettings, ...elementsFromProps }), [elementsFromProps]);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const wheelController = useRef<WheelController | null>(null);
  const { handleSubmit, setValue } = useFormContext<Wheel.Settings>();
  const formValues = useWatch<Wheel.Settings>();
  const { randomSpinEnabled, randomSpinConfig, spinTime } = formValues;
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant' });

  useImperativeHandle<RandomWheelController, RandomWheelController>(
    wheelRef,
    () => ({
      setItems: (items: WheelItem[]) => {
        setItemsFromProps(items);
      },
      spin: wheelController.current ? (params?: SpinParams) => wheelController.current!.spin(params) : undefined,
    }),
    [],
  );

  useEffect(() => {
    const { split, ...settings } = formValues;
    try {
      localStorage.setItem('wheelSettings', JSON.stringify(settings));
    } catch (error) {
      console.error(error);
    }
  }, [formValues, setValue]);

  useEffect(() => {
    wheelController.current?.resetPosition();
    wheelController.current?.clearWinner();
  }, [format, dropoutVariant]);

  const wheelStrategy = useWheelResolver({ format, dropoutVariant, controller: wheelController });
  const { items, init, extraSettings, renderSubmitButton, onSpinEnd, content } = wheelStrategy;

  const filteredItems = useMemo(
    () =>
      getTotalSize(itemsFromProps)
        ? itemsFromProps.filter(({ amount }) => amount && amount > 0)
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
      const { min, max } = randomSpinConfig!;
      const duration = randomSpinEnabled ? random.getInt(min!, max!) : spinTime;

      const initialSpinParams = {
        duration,
        distance: calculateRandomSpinDistance({ duration, seed: useRandomOrg ? await getSeed() : undefined }),
      };

      const spinConfig = wheelStrategy.onSpinStart?.(initialSpinParams, wheelController.current?.getItems() ?? []);

      const config = {
        ...initialSpinParams,
        ...spinConfig,
      };

      onSpinStart?.(config);
      const winner = await wheelController.current?.spin(config);
      await onSpinEnd?.(winner);
      winner && onWin?.(winner as TWheelItem);
    },
    [getSeed, onSpinEnd, wheelStrategy, onSpinStart, onWin, randomSpinConfig, randomSpinEnabled, spinTime],
  );

  const split = useWatch<Wheel.Settings>({ name: 'split' });
  const maxSize = useMemo(() => Math.max(...items.map<number>(({ amount }) => Number(amount))), [items]);
  const deleteWheelItem = (id: Key) => {
    if (format === WheelFormat.Default) {
      setItemsFromProps(itemsFromProps.filter((item) => item.id !== id));
    }

    deleteItem?.(id);
  };

  const shuffledItems = useMemo(() => (shouldShuffle ? shuffle(items) : items), [items, shouldShuffle]);

  const splittedItems = useMemo(() => {
    if (split === 1) {
      return shuffledItems;
    }

    const newItems = wheelUtils.splitItems(shuffledItems, split * maxSize);
    return newItems.length ? array.distributeEvenly(newItems) : [];
  }, [shuffledItems, maxSize, split]);

  useEffect(() => {
    onWheelItemsChanged?.(splittedItems);
  }, [splittedItems, onWheelItemsChanged]);

  return (
    <WheelContextProvider controller={wheelController} changeInitialItems={setItemsFromProps}>
      <form className='wheel-content' onSubmit={handleSubmit(onSpinClick)}>
        {!content && elements.preview && <ItemsPreview allItems={filteredItems} activeItems={items} format={format} />}
        {content && <div className='wheel-content-negative-space' />}
        <WheelFlexboxAutosizer>
          {({ onOptimalSizeChange }) => (
            <WheelComponent
              finalItems={splittedItems}
              deleteItem={deleteWheelItem}
              controller={wheelController}
              onOptimalSizeChange={onOptimalSizeChange}
            />
          )}
        </WheelFlexboxAutosizer>
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

interface RandomWheelProviderProps<TWheelItem extends WheelItem = WheelItem> extends RandomWheelProps<TWheelItem> {
  form?: React.RefObject<UseFormReturn<Wheel.Settings>>;
}

const Provider = <TWheelItem extends WheelItem = WheelItem>(
  props: RandomWheelProviderProps<TWheelItem>,
): ReactElement => {
  const initial = useMemo(
    () => ({ ...initialSettings, spinTime: props.initialSpinTime || initialSettings.spinTime }),
    [props.initialSpinTime],
  );
  const form = useForm<Wheel.Settings>({ defaultValues: initial });

  useImperativeHandle<UseFormReturn<Wheel.Settings>, UseFormReturn<Wheel.Settings>>(props.form, () => form);

  return (
    <FormProvider {...form}>
      <RandomWheel {...props} />
    </FormProvider>
  );
};

export default Provider;
