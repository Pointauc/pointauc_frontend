import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Badge, Button, Group, Text } from '@mantine/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import * as Integration from '@models/integration';

interface IntegrationLoginButtonProps {
  branding: Integration.Branding;
  id: Integration.ID;
  onClick: () => void;
  classes?: Integration.LoginButtonClasses;
  showPartnerChip?: boolean;
  color?: string;
}

const IntegrationLoginButton = ({
  branding,
  id,
  onClick,
  classes,
  showPartnerChip,
  color,
}: IntegrationLoginButtonProps) => {
  const { t } = useTranslation();
  const { icon: Icon, partner, description, extraDescription, title } = branding;
  const isPartner = Boolean(partner && (description || extraDescription));
  const titleText = title || t(`integration.${id}.name`);

  if (isPartner) {
    const button = (
      <div>
        <Button
          className={clsx('relative z-10 h-auto min-h-[56px] px-4 py-2', classes?.button)}
          classNames={{ label: 'flex flex-col items-start' }}
          variant='filled'
          onClick={onClick}
          data-integration={id}
        >
          <Group w='100%' justify='center' gap='xs'>
            <Icon size={22} classes={classes?.icon} />
            <Text size='lg' fw={600}>
              {titleText}
            </Text>
          </Group>
          <Text size='xs'>{description}</Text>
        </Button>
        {extraDescription && (
          <Text className='-mt-2 rounded-b-lg bg-[#344b66] pt-3 pb-1 text-center opacity-90' size='xs'>
            {extraDescription}
          </Text>
        )}
      </div>
    );

    if (!showPartnerChip) {
      return button;
    }

    return (
      <div className='relative'>
        {button}
        <Badge className='pointer-events-none absolute -top-1 -right-1 rounded-full' color='green.6' variant='filled'>
          <ThumbUpIcon sx={{ fontSize: 12 }} />
        </Badge>
      </div>
    );
  }

  return (
    <Button
      className={clsx('h-10 px-3 text-[#f1f1f1]', classes?.button)}
      variant='filled'
      leftSection={<Icon size={22} classes={classes?.icon} />}
      onClick={onClick}
      data-integration={id}
      color={color}
    >
      {titleText}
    </Button>
  );
};

export default IntegrationLoginButton;
