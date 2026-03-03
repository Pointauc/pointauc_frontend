import donatePay from '@domains/bids/external-integrations/DonatePay';
import da from '@domains/bids/external-integrations/DA';
import twitch from '@domains/bids/external-integrations/Twitch';
import tourniquet from '@domains/bids/external-integrations/Tourniquet';
import donatex from '@domains/bids/external-integrations/DonateX/index.tsx';
import ihaq from '@domains/bids/external-integrations/ihaq/lib/integrationScheme';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import donateHelper from '@domains/bids/external-integrations/donate-helper/lib/integrationScheme';

const INTEGRATIONS = [donateHelper, donatex, twitch, da, donatePay, ihaq, tourniquet];

export default INTEGRATIONS;

const { donate, points } = integrationUtils.groupBy.type(INTEGRATIONS);

export const integrations = {
  all: INTEGRATIONS,
  donate,
  points,
};
