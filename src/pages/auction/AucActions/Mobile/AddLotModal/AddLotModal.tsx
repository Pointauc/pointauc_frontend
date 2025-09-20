import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import AddIcon from '@mui/icons-material/Add';

import { RootState } from '@reducers';
import { addSlot } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { updatePercents } from '@services/PercentsRefMap.ts';

interface AddLotModalProps {
  opened: boolean;
  onClose: () => void;
}

const AddLotModal: FC<AddLotModalProps> = ({ opened, onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);

  const [lotName, setLotName] = useState('');
  const [lotAmount, setLotAmount] = useState('');
  const [lotChance, setLotChance] = useState('');

  const percentsRef = useRef<HTMLSpanElement>(null);

  const getNewSlot = useCallback(
    (): Partial<Slot> => ({
      amount: Number(lotAmount) || null,
      name: lotName,
    }),
    [lotAmount, lotName],
  );

  const updateNewSlotChance = useCallback(() => {
    if (showChances && percentsRef.current) {
      const slot: Slot = { ...getNewSlot(), id: Math.random().toString() } as Slot;
      const refMap = new Map<string, HTMLSpanElement>([[slot.id, percentsRef.current]]);

      updatePercents([...slots, slot], refMap);
      setLotChance(percentsRef.current.textContent || '');
    }
  }, [getNewSlot, showChances, slots]);

  useEffect(() => {
    updateNewSlotChance();
  }, [updateNewSlotChance, lotAmount]);

  const resetForm = useCallback(() => {
    setLotName('');
    setLotAmount('');
    setLotChance('');
  }, []);

  const createNewSlot = useCallback(() => {
    const slot = getNewSlot();
    dispatch(addSlot(slot));
    resetForm();
    onClose();
  }, [dispatch, getNewSlot, resetForm, onClose]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Title order={3}>{t('auc.addPosition')}</Title>}
      size='sm'
      centered
    >
      <Stack gap='md'>
        <TextInput
          label={t('auc.newLotName')}
          placeholder={t('auc.newLotName')}
          value={lotName}
          onChange={(e) => setLotName(e.target.value)}
        />

        <TextInput
          label={t('common.currencySign')}
          placeholder={t('common.currencySign')}
          type='number'
          value={lotAmount}
          onChange={(e) => {
            setLotAmount(e.target.value);
          }}
        />

        {showChances && lotChance && (
          <Text size='sm' c='dimmed'>
            {t('auc.chance')}: {lotChance}
          </Text>
        )}

        <Group justify='flex-end' gap='sm'>
          <Button variant='subtle' onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button leftSection={<AddIcon />} onClick={createNewSlot}>
            {t('auc.addPosition')}
          </Button>
        </Group>
      </Stack>

      {/* Hidden element for percentage calculation */}
      <span ref={percentsRef} style={{ display: 'none' }} />
    </Modal>
  );
};

export default AddLotModal;
