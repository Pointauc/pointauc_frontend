import { Badge, Center, Menu, Paper, useMantineTheme } from '@mantine/core';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TagIcon from '@mui/icons-material/Tag';
import classNames from 'classnames';
import { DragEvent, memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Slot } from '@models/slot.model.ts';
import { openTrailer } from '@reducers/ExtraWindows/ExtraWindows.ts';
import { Purchase, setDraggedRedemption, updateExistBids } from '@reducers/Purchases/Purchases.ts';
import { addBid, deleteSlot, setSlotName } from '@reducers/Slots/Slots.ts';
import slotNamesMap from '@services/SlotNamesMap';
import bidUtils from '@utils/bid.utils';
import { handleDragOver } from '@utils/common.utils.ts';

import styles from './DroppableSlot.module.css';
import './Slot.scss';
import SlotComponent from './SlotComponent';

interface DroppableSlotProps {
  index: number;
  slot: Slot;
  readonly?: boolean;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, slot, readonly }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const extraIcon = useRef<HTMLButtonElement>(null);
  const { id, amount, name } = slot;
  const slotElement = useRef<HTMLDivElement>(null);
  const enterCounter = useRef<number>(0);

  const resetOverStyle = useCallback(() => {
    enterCounter.current = 0;

    requestAnimationFrame(() => {
      if (slotElement.current) {
        slotElement.current.classList.remove('drag-over');
        slotElement.current.classList.remove('remove-cost');
      }
    });
  }, []);

  const updateOverStyle = useCallback(
    (enterCounterChange: number, isRemove?: boolean) => {
      enterCounter.current += enterCounterChange;

      if (enterCounter.current > 0) {
        requestAnimationFrame(() => {
          if (slotElement.current) {
            slotElement.current.classList.add('drag-over');

            if (isRemove) {
              slotElement.current.classList.add('remove-cost');
            }
          }
        });
      } else {
        resetOverStyle();
      }
    },
    [resetOverStyle],
  );

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const slotWrapperClasses = classNames('slot-wrapper', styles.card);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const bid: Purchase = JSON.parse(e.dataTransfer.getData('redemption'));
      const name = bidUtils.getName(bid);

      slotNamesMap.set(name, id);
      dispatch(addBid(id, bid));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name }));
      }
      resetOverStyle();
    },
    [dispatch, id, name, resetOverStyle],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      updateOverStyle(1, e.dataTransfer.types.includes('remove'));
    },
    [updateOverStyle],
  );

  const handleDragLeave = useCallback(() => {
    updateOverStyle(-1);
  }, [updateOverStyle]);

  const handleOpenTrailer = useCallback(() => {
    dispatch(openTrailer(name || ''));
  }, [dispatch, name]);

  const theme = useMantineTheme();

  return (
    <Paper
      radius='md'
      shadow='md'
      className={slotWrapperClasses}
      ref={slotElement}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className='slot'>
        <div className={styles.index}>{`${index}`}</div>
        <Center className={styles.fastIndexWrapper}>
          <Badge
            size='lg'
            color={`${theme.primaryColor}.9`}
            variant='light'
            classNames={{ root: styles.fastIndex, section: styles.fastIndexIcon }}
            leftSection={<TagIcon fontSize='small' />}
          >
            {`${slot.fastId}`}
          </Badge>
        </Center>
        <SlotComponent slot={slot} readonly={readonly} />
      </div>
      {!readonly && (
        <button onClick={handleDelete} className=' slot-icon-button delete-button' title={t('lot.delete')}>
          <DeleteIcon />
        </button>
      )}
      <Menu width={200} shadow='lg' offset={-2} position='bottom-start' withArrow>
        <Menu.Target>
          <button
            className='slot-icon-button delete-button'
            title={t('lot.extra')}
            aria-controls='extra'
            ref={extraIcon}
          >
            <MoreHorizIcon />
          </button>
        </Menu.Target>
        <Menu.Dropdown id='extra'>
          <Menu.Item onClick={handleOpenTrailer}>{t('lot.trailer')}</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
};

const MemorizedDroppableSlot = memo(DroppableSlot);

export default MemorizedDroppableSlot;
