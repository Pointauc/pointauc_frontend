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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';

import ItemsPreview from '@domains/winner-selection/wheel-of-random/ui/ItemsPreview';
import WheelComponent from '@domains/winner-selection/wheel-of-random/ui/FormWheel';
import { WheelContextProvider } from '@domains/winner-selection/wheel-of-random/settings/ui/Context/WheelContext';
import WheelSettings from '@domains/winner-selection/wheel-of-random/settings/ui/Form/WheelSettings';
import useWheelResolver from '@domains/winner-selection/wheel-of-random/lib/strategy/useWheelResolver';
import useTicketManagement, {
  RevealedData,
} from '@domains/winner-selection/wheel-of-random/lib/hooks/useTicketManagement';
import wheelUtils from '@domains/winner-selection/wheel-of-random/lib/wheelUtils';
import { PACE_PRESETS, WheelFormat } from '@constants/wheel.ts';
import withLoading from '@decorators/withLoading';
import { WheelItem } from '@models/wheel.model.ts';
import { getTotalSize, random, shuffle } from '@utils/common.utils.ts';
import array from '@utils/dataType/array.ts';
import { getRandomNumber } from '@api/randomApi';
import { signedRandomControllerGenerateWinnerMutation } from '@api/openapi/@tanstack/react-query.gen';
import { useSyncEffect } from '@shared/lib/react';

import { SpinParams, DropoutVariant, WheelController } from '../../BaseWheel/BaseWheel';
import WheelFlexboxAutosizer from '../../BaseWheel/FlexboxAutosizer';
import { MAX_QUOTA } from '../../settings/ui/Fields/TicketCard/TicketCard';

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

  randomnessSource: 'local-basic',
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

interface RandomOrgTicketResponse {
  jsonrpc: string;
  id: number;
  result: {
    ticketId: string;
    creationTime: string;
    usedTime: string;
    random: {
      data: number[];
      completionTime: string;
    };
  };
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
  const { handleSubmit, setValue, control } = useFormContext<Wheel.Settings>();
  const randomSpinEnabled = useWatch({ name: 'randomSpinEnabled', control });
  const randomSpinConfig = useWatch({ name: 'randomSpinConfig', control });
  const spinTime = useWatch({ name: 'spinTime', control });
  const randomnessSource = useWatch({ name: 'randomnessSource', control });
  const format = useWatch({ name: 'format', control });
  const dropoutVariant = useWatch({ name: 'dropoutVariant', control });
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Ticket management for signed random.org flow
  const {
    activeTicketId,
    availableQuota,
    setAvailableQuota,
    setRevealedTicketId,
    resetRevealedTicket,
    refreshActiveTicket,
    isCreating,
    setShouldRevealNumber,
    shouldRevealNumber,
    error,
  } = useTicketManagement(randomnessSource === 'random-org-signed');

  // Mutation for generating winner with signed random.org
  const signedWinnerMutation = useMutation({
    ...signedRandomControllerGenerateWinnerMutation(),
    onError: (error) => {
      if (error?.response?.data?.code === 'QUOTA_EXCEEDED') {
        setAvailableQuota(0);
        notifications.show({
          title: t('wheel.ticket.quotaExceeded'),
          message: t('wheel.ticket.quotaExceededMessage', { totalQuota: MAX_QUOTA }),
          color: 'red',
          autoClose: 10000,
          withCloseButton: true,
        });
      } else {
        notifications.show({
          title: t('wheel.ticket.spinUnknownErrorTitle'),
          message: t('wheel.ticket.spinUnknownErrorMessage', { error: error.response?.data?.message }),
          color: 'red',
          autoClose: 10000,
          withCloseButton: true,
        });
      }
    },
  });

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
    wheelController.current?.resetPosition();
    wheelController.current?.clearWinner();
  }, [format, dropoutVariant]);

  const wheelStrategy = useWheelResolver({ format, dropoutVariant, controller: wheelController });
  const { items, init, extraSettings, renderSubmitButton, onSpinEnd, content } = wheelStrategy;

  const filteredItems = useMemo(() => {
    const filtered = getTotalSize(itemsFromProps)
      ? itemsFromProps.filter(({ amount }) => amount && amount > 0)
      : itemsFromProps.map((item) => ({ ...item, amount: 1 }));

    return filtered.sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  }, [itemsFromProps]);

  useSyncEffect(() => {
    init?.(filteredItems);
  }, [init, filteredItems]);

  const randomOrgTicketQuery = useQuery({
    queryKey: ['random-org-ticket', activeTicketId],
    queryFn: () =>
      axios
        .post<RandomOrgTicketResponse>('https://api.random.org/json-rpc/4/invoke', {
          jsonrpc: '2.0',
          method: 'getTicket',
          params: {
            ticketId: activeTicketId,
          },
          id: Math.floor(Math.random() * 10000),
        })
        .then((res) => res.data),
    enabled: !!activeTicketId,
    staleTime: 1000 * 60 * 60,
  });

  const getSeed = useCallback(async () => {
    const totalSize = getTotalSize(filteredItems);
    const size = totalSize * 100;
    const seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, size).catch(() => undefined);

    if (seed == null) return null;

    return seed && seed / size;
  }, [filteredItems]);

  const onSpinClick = useCallback(
    async ({ randomnessSource }: Wheel.Settings) => {
      const { min, max } = randomSpinConfig!;
      const duration = (randomSpinEnabled ? random.getInt(min!, max!) : spinTime) ?? 20;

      const generateSeed = async (): Promise<number> => {
        if (randomnessSource === 'random-org') {
          // Simple random.org API call
          const seed = await getSeed();
          return seed ?? random.value();
        } else if (randomnessSource === 'random-org-signed') {
          // Signed random.org flow
          if (!activeTicketId) {
            setValue('randomnessSource', 'local-basic');
            return random.value();
          }

          const participants = filteredItems.map((item) => ({
            name: item.name,
            amount: item.amount,
          }));

          const response = await signedWinnerMutation.mutateAsync({
            body: {
              participants,
            },
          });
          queryClient.setQueryData(['random-org-ticket', activeTicketId], {
            ...randomOrgTicketQuery.data,
            result: {
              ...randomOrgTicketQuery.data?.result,
              random: response.random,
              signature: response.signature,
              usedTime: response.random.completionTime,
            },
          });
          setAvailableQuota(response.quotaLeft);
          refreshActiveTicket();
          setRevealedTicketId(response.random.ticketData.ticketId);
          // Extract random number and completion time from response
          const randomData = response.random;
          const randomNumber = randomData.data[0];

          return randomNumber !== undefined ? randomNumber : random.value();
        }

        // Local basic randomness
        return random.value();
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

      if (randomnessSource === 'random-org-signed' && winnerResult.isFinalSpin) {
        setShouldRevealNumber(true);
      }

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
      activeTicketId,
      filteredItems,
      signedWinnerMutation,
      queryClient,
      randomOrgTicketQuery.data,
      setAvailableQuota,
      refreshActiveTicket,
      setRevealedTicketId,
      setValue,
      setShouldRevealNumber,
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

  const visibleRevealedData: RevealedData | null = randomOrgTicketQuery.data
    ? {
        ticketId: randomOrgTicketQuery.data.result.ticketId,
        createdAt: randomOrgTicketQuery.data.result.creationTime,
        revealedAt: randomOrgTicketQuery.data.result.usedTime,
        randomNumber: shouldRevealNumber ? randomOrgTicketQuery.data.result.random.data[0] : null,
      }
    : null;

  const drawNewTicket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetRevealedTicket();
  };

  const renderSubmitButton2 = visibleRevealedData?.randomNumber
    ? () => (
        <Button variant='contained' onClick={drawNewTicket}>
          {t('wheel.ticket.drawNewTicket')}
        </Button>
      )
    : renderSubmitButton;

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
              isLoadingSeed={isLoadingSeed || signedWinnerMutation.isPending}
              controls={elements}
              renderSubmitButton={renderSubmitButton2}
              ticketData={visibleRevealedData}
              availableQuota={availableQuota}
              isCreatingTicket={isCreating}
              ticketError={error}
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

        try {
          localStorage.setItem('wheelSettings', JSON.stringify(data.values));
        } catch (error) {
          console.error(error);
        }
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
