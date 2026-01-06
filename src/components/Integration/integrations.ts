import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';
import ihaq from '@domains/external-integration/ihaq/lib/integrationScheme.ts';
import donateHelper from '@domains/external-integration/donateHelper/lib/integrationScheme.ts';
import tourniquet from '@components/Integration/Tourniquet';

const INTEGRATIONS = [twitch, donateHelper, da, donatePay, ihaq, tourniquet];

export default INTEGRATIONS;

const { donate, points } = integrationUtils.groupBy.type(INTEGRATIONS);

export const integrations = {
  all: INTEGRATIONS,
  donate,
  points,
};
