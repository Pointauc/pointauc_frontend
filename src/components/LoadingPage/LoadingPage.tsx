import { Center, Loader, Stack, Text } from '@mantine/core';
import './LoadingPage.scss';

interface LoadingPageProps {
  helpText?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ helpText }) => {
  return (
    <Center h='100vh' w='100vw'>
      <Stack align='center' justify='center'>
        <Loader size={76} type='dots' />
        {!!helpText && <Text size='lg'>{helpText}</Text>}
      </Stack>
    </Center>
  );
};

export default LoadingPage;
