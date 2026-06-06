import * as Integration from '@models/integration';

const SUBSCRIBE_TIMEOUT_BY_TYPE: Record<Integration.BidType, number> = {
  donate: 10_000,
  points: 15_000,
};

const createSubscribeTimeoutError = (integration: Integration.Config): Error =>
  new Error(`${integration.id} subscription timed out after ${SUBSCRIBE_TIMEOUT_BY_TYPE[integration.type]}ms`);

export const connectIntegrationWithTimeout = async (integration: Integration.Config): Promise<void> => {
  let timeoutId: number | undefined;

  try {
    await Promise.race([
      integration.pubsubFlow.connect(),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(
          () => reject(createSubscribeTimeoutError(integration)),
          SUBSCRIBE_TIMEOUT_BY_TYPE[integration.type],
        );
      }),
    ]);
  } catch (err) {
    integration.pubsubFlow.store.setState({ subscribed: false, loading: false });
    throw err;
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};
