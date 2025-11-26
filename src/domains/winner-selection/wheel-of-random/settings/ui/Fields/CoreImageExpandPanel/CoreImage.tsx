import { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import { Emote } from '@kozjar/twitch-emoticons';
import { Button, Collapse, Stack, Text } from '@mantine/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput.tsx';
import TwitchEmotesList from '@components/TwitchEmotesList/TwitchEmotesList.tsx';
import { getRandomIntInclusive } from '@utils/common.utils.ts';

import styles from './CoreImage.module.css';

const CoreImageField = () => {
  const { setValue, getValues } = useFormContext<Wheel.Settings>();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const getRandomEmote = useCallback((emotes: Emote[]): string => {
    const index = getRandomIntInclusive(0, emotes.length - 1);
    const { max = 2 } = emotes[index] as any;

    return emotes[index].toLink(max);
  }, []);

  const handleEmotesLoad = useCallback(
    (emotes: Emote[]) => {
      if (emotes.length) {
        const previous = getValues('coreImage');
        setValue('coreImage', previous || getRandomEmote(emotes));
      }
    },
    [getRandomEmote, getValues, setValue],
  );

  const coreImage: string | null = useWatch<Wheel.Settings>({ name: 'coreImage' });
  useEffect(() => {
    if (coreImage && coreImage.length < 2500000) {
      localStorage.setItem('wheelEmote', coreImage);
    }
  }, [coreImage]);

  return (
    <>
      <Button
        w='100%'
        variant='transparent'
        rightSection={<ExpandMoreIcon className={isExpanded ? 'rotate-180' : 'rotate-0'} />}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text size='md'>{t('wheel.coreImage.expandPanel')}</Text>
      </Button>
      <Collapse in={isExpanded} className={styles.collapse}>
        <Stack mah={390} gap='sm' w='100%'>
          <Controller
            render={({ field: { onChange } }) => (
              <TwitchEmotesList setActiveEmote={onChange} onEmotesLoad={handleEmotesLoad} />
            )}
            name='coreImage'
          />
          <Controller
            render={({ field: { onChange } }) => (
              <ImageLinkInput
                dialogTitle={t('wheel.coreImage.customImageDialogTitle')}
                buttonTitle={t('wheel.loadCustomMessage')}
                buttonClass={styles.uploadButton}
                onChange={onChange}
              />
            )}
            name='coreImage'
          />
        </Stack>
      </Collapse>
    </>
  );
};

export default CoreImageField;
