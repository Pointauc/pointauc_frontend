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

import ItemsPreview from '@domains/winner-selection/wheel-of-random/ui/ItemsPreview';
import WheelComponent from '@domains/winner-selection/wheel-of-random/ui/FormWheel';
import { WheelContextProvider } from '@domains/winner-selection/wheel-of-random/settings/ui/Context/WheelContext';
import WheelSettings from '@domains/winner-selection/wheel-of-random/settings/ui/Form/WheelSettings';
import useWheelResolver from '@domains/winner-selection/wheel-of-random/lib/strategy/useWheelResolver';
import wheelUtils from '@domains/winner-selection/wheel-of-random/lib/wheelUtils';
import { PACE_PRESETS, WheelFormat } from '@constants/wheel.ts';
import withLoading from '@decorators/withLoading';
import { WheelItem } from '@models/wheel.model.ts';
import { getTotalSize, random, shuffle } from '@utils/common.utils.ts';
import array from '@utils/dataType/array.ts';
import { getRandomNumber } from '@api/randomApi';
import { useSyncEffect } from '@shared/lib/react';

import { SpinParams, DropoutVariant, WheelController } from '../../BaseWheel/BaseWheel';
import WheelFlexboxAutosizer from '../../BaseWheel/FlexboxAutosizer';

import styles from './index.module.css';

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

export interface SpinStartCallbackParams {
  changedDistance: number;
  initialDistance: number;
  winnerItem: WheelItem;
  duration: number;
}

interface RandomWheelProps<TWheelItem extends WheelItem = WheelItem> {
  items: TWheelItem[];
  initialSpinTime?: number;
  shouldShuffle?: boolean;
  elements?: Partial<SettingElements>;
  children?: ReactNode;
  wheelRef?: React.RefObject<RandomWheelController | null>;
  // callbacks
  deleteItem?: (id: Key) => void;
  onWin?: (winner: TWheelItem) => void;
  onWheelItemsChanged?: (items: TWheelItem[]) => void;
  onSettingsChanged?: (settings: Wheel.Settings) => void;
  onSpinStart?: (params: SpinStartCallbackParams) => void;
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
  wheelStyles: 'default',
  showDeleteConfirmation: true,
};
const savedSettings = JSON.parse(localStorage.getItem('wheelSettings') ?? '{}');
const initialSettings = { ...defaultSettings, ...savedSettings };

export interface RandomWheelController {
  setItems: (items: WheelItem[]) => void;
  spin?: WheelController['spin'];
}

const FullWheelUI = <TWheelItem extends WheelItem = WheelItem>({
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
      spin: wheelController.current ? (params: SpinParams) => wheelController.current!.spin(params) : undefined,
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

  useSyncEffect(() => {
    init?.(filteredItems);
  }, [init, filteredItems]);

  const getSeed = useCallback(async () => {
    const totalSize = getTotalSize(items);
    const size = totalSize * 100;
    const seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, size).catch(() => undefined);

    return seed && seed / size;
  }, [items]);

  const onSpinClick = useCallback(
    async ({ useRandomOrg }: Wheel.Settings) => {
      const { min, max } = randomSpinConfig!;
      const duration = (randomSpinEnabled ? random.getInt(min!, max!) : spinTime) ?? 20;

      const generateSeed = async (): Promise<number> => {
        const seed = useRandomOrg ? await getSeed() : undefined;
        return seed ?? random.value();
      };

      const winnerResult = await wheelStrategy.getNextWinnerId({
        generateSeed,
        items: wheelController.current?.getItems() ?? [],
      });
      const winnerItem = itemsFromProps.find((item) => item.id === winnerResult.id);

      const config: SpinParams = {
        duration,
        winnerId: winnerResult.id,
      };

      const spinResult = wheelController.current?.spin(config);

      onSpinStart?.({
        changedDistance: spinResult?.changedDistance ?? 0,
        initialDistance: spinResult?.initialDistance ?? 0,
        winnerItem: winnerItem as TWheelItem,
        duration,
      });

      await spinResult?.animate();
      await onSpinEnd?.(winnerItem);
      winnerItem && onWin?.(winnerItem as TWheelItem);
    },
    [
      randomSpinConfig,
      randomSpinEnabled,
      spinTime,
      wheelStrategy,
      itemsFromProps,
      onSpinStart,
      onSpinEnd,
      onWin,
      getSeed,
    ],
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
        <div
          className={classNames(styles.rightSide, 'wheel-info-wrapper', {
            shrink: content,
            [styles.withExtraContent]: content,
          })}
        >
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
  form?: React.RefObject<UseFormReturn<Wheel.Settings> | null>;
}

const Provider = <TWheelItem extends WheelItem = WheelItem>(
  props: RandomWheelProviderProps<TWheelItem>,
): ReactElement => {
  const initial = useMemo(
    () => ({ ...initialSettings, spinTime: props.initialSpinTime || initialSettings.spinTime }),
    [props.initialSpinTime],
  );
  const form = useForm<Wheel.Settings>({ defaultValues: initial });
  const { onSettingsChanged } = props;

  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: {
        values: true,
      },
      callback: (data) => {
        onSettingsChanged?.(data.values as Wheel.Settings);
      },
    });

    return () => unsubscribe();
  }, [form, onSettingsChanged]);

  useImperativeHandle<UseFormReturn<Wheel.Settings>, UseFormReturn<Wheel.Settings>>(props.form, () => form);

  return (
    <FormProvider {...form}>
      <FullWheelUI {...props} />
    </FormProvider>
  );
};

export default Provider;
