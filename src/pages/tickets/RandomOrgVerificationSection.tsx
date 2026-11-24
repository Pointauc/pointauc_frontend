import { Box, Button, Card, Collapse, Group, Stack, Text, Title } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { RandomOrgVerificationMetadataDto } from '@api/openapi/types.gen';

interface RandomOrgVerificationSectionProps {
  verificationMetadata: RandomOrgVerificationMetadataDto;
}

const RANDOM_ORG_SIGNATURE_FORM_URL = 'https://api.random.org/signatures/form';

/**
 * Collapsible section with the signed Random.org data and signature,
 * allowing anyone to verify the random number independently.
 */
const RandomOrgVerificationSection = ({ verificationMetadata }: RandomOrgVerificationSectionProps) => {
  const { t } = useTranslation();
  const [isOpened, { toggle: toggleVerification }] = useDisclosure(false);

  return (
    <Card
      shadow='sm'
      padding='lg'
      radius='md'
      withBorder
      onClick={toggleVerification}
      style={{ cursor: 'pointer' }}
      aria-expanded={isOpened}
    >
      <Stack gap='sm'>
        <Stack gap='0'>
          <Group justify='space-between' align='center' wrap='nowrap'>
            <Group gap='xs' align='center' wrap='nowrap' flex={1} miw={0} style={{ userSelect: 'none' }}>
              {isOpened ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
              <Title order={3}>{t('tickets.revealed.verificationSection')}</Title>
            </Group>
            <Button
              component='a'
              href={RANDOM_ORG_SIGNATURE_FORM_URL}
              target='_blank'
              rel='noopener noreferrer'
              variant='light'
              size='sm'
              rightSection={<IconExternalLink size={16} />}
              style={{ flexShrink: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              {t('tickets.revealed.verifySignature')}
            </Button>
          </Group>

          <Text size='sm' c='dimmed'>
            {t('tickets.revealed.verificationSectionCollapsedHint')}
          </Text>
        </Stack>

        <Collapse expanded={isOpened} keepMounted>
          <Box onClick={(event) => event.stopPropagation()} style={{ cursor: 'default' }}>
            <Stack gap='sm'>
              <Title order={4} mt='xs'>
                {t('tickets.revealed.randomData')}
              </Title>
              <CodeHighlight
                code={JSON.stringify(verificationMetadata.randomData, null, 2)}
                language='json'
                withCopyButton
                copyLabel={t('common.copy')}
                copiedLabel={t('common.copied')}
                style={{ maxHeight: '150px', overflow: 'auto' }}
              />
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.randomDataDescription')}
              </Text>

              <Title order={4}>{t('tickets.revealed.signature')}</Title>
              <CodeHighlight
                code={verificationMetadata.signature}
                language='text'
                withCopyButton
                copyLabel={t('common.copy')}
                copiedLabel={t('common.copied')}
              />
              <Text size='sm' c='dimmed'>
                {t('tickets.revealed.signatureDescription')}
              </Text>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Card>
  );
};

export default RandomOrgVerificationSection;
