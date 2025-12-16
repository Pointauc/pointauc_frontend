import { Button, Group, Stack, Textarea, Tooltip } from '@mantine/core';
import { t } from 'i18next';
import { useState } from 'react';

interface ManualImportProps {
  extraControls?: React.ReactNode;
  onSubmit: (input: string) => void;
}

const ManualImport = ({ extraControls, onSubmit }: ManualImportProps) => {
  const [manualInput, setManualInput] = useState<string>('');

  const handleSubmitClick = () => {
    onSubmit(manualInput);
  };

  return (
    <Stack>
      <Textarea
        rows={14}
        placeholder={t('wheel.typeParticipants')}
        value={manualInput}
        onChange={(e) => setManualInput(e.target.value)}
      />
      <Group justify='space-between' align='center'>
        {extraControls}
        <Tooltip label={t('wheel.import.submitDisabled')} disabled={!!manualInput}>
          <Button onClick={handleSubmitClick} disabled={!manualInput}>
            {t('common.apply')}
          </Button>
        </Tooltip>
      </Group>
    </Stack>
  );
};

export default ManualImport;
