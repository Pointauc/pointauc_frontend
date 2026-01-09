import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';
import ihaq from '@domains/external-integration/ihaq/lib/integrationScheme.ts';
import tourniquet from '@components/Integration/Tourniquet';
import donatex from '@components/Integration/DonateX/index.tsx';

const INTEGRATIONS = [twitch, donatex, da, donatePay, ihaq, tourniquet];

export default INTEGRATIONS;

const { donate, points } = integrationUtils.groupBy.type(INTEGRATIONS);

export const integrations = {
  all: INTEGRATIONS,
  donate,
  points,
};
