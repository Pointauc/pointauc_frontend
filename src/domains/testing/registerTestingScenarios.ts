import { createAuctionTestingScenarios } from './model/auctionScenarios';

interface AppStore {
  dispatch: (action: unknown) => unknown;
  getState: () => unknown;
}

type AuctionTestingScenarios = ReturnType<typeof createAuctionTestingScenarios>;
type LotTestingScenarioName = keyof AuctionTestingScenarios;
type LotBidScenarioName = Extract<
  LotTestingScenarioName,
  'startHighFrequencyBids' | 'startUltraHighFrequencyBids'
>;
export type TestingScenarioId = `lots.${LotTestingScenarioName}`;

export interface TestingScenarios {
  enabledScenarios: TestingScenarioId[];
  stopAll: () => void;
}

declare global {
  interface Window {
    pointaucTesting?: TestingScenarios;
  }
}

const createNoopTestingScenarios = (): TestingScenarios => ({ enabledScenarios: [], stopAll: () => undefined });

const getEnabledLotScenarioNames = (enabledScenarios: TestingScenarioId[]): LotTestingScenarioName[] => {
  return enabledScenarios
    .filter((scenarioId) => scenarioId.startsWith('lots.'))
    .map((scenarioId) => scenarioId.replace('lots.', '') as LotTestingScenarioName);
};

const checkIsLotBidScenarioName = (scenarioName: LotTestingScenarioName): scenarioName is LotBidScenarioName => {
  return scenarioName === 'startHighFrequencyBids' || scenarioName === 'startUltraHighFrequencyBids';
};

const runLotScenario = (
  scenarioName: LotTestingScenarioName,
  auctionScenarios: AuctionTestingScenarios,
  addStopHandler: (stop: () => void) => void,
): void => {
  if (checkIsLotBidScenarioName(scenarioName)) {
    addStopHandler(auctionScenarios[scenarioName]());
    return;
  }

  auctionScenarios[scenarioName]();
};

export const registerTestingScenarios = (
  store: AppStore,
  enabledScenarios: TestingScenarioId[] = [],
): TestingScenarios => {
  if (import.meta.env.PROD) {
    return createNoopTestingScenarios();
  }

  const stopHandlers: (() => void)[] = [];
  const auctionScenarios = createAuctionTestingScenarios(store as Parameters<typeof createAuctionTestingScenarios>[0]);
  const enabledLotScenarioNames = getEnabledLotScenarioNames(enabledScenarios);

  const addStopHandler = (stop: () => void): void => {
    stopHandlers.push(stop);
  };

  enabledLotScenarioNames.forEach((scenarioName) => runLotScenario(scenarioName, auctionScenarios, addStopHandler));

  const scenarios: TestingScenarios = {
    enabledScenarios,
    stopAll: () => {
      stopHandlers.splice(0).forEach((stop) => stop());
    },
  };

  window.pointaucTesting = scenarios;

  return scenarios;
};
