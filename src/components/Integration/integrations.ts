import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';
import tourniquet from '@components/Integration/Tourniquet';

const INTEGRATIONS = [twitch, da, donatePay, tourniquet];

export default INTEGRATIONS;

const { donate, points } = integrationUtils.groupBy.type(INTEGRATIONS);

export const integrations = {
  all: INTEGRATIONS,
  donate,
  points,
};
