import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';
import twitch from '@components/Integration/Twitch';
import { integrationUtils } from '@components/Integration/helpers.ts';

const INTEGRATIONS = [twitch, da, donatePay];

export default INTEGRATIONS;

const { donate, points } = integrationUtils.groupBy.type(INTEGRATIONS);

export const integrations = {
  all: INTEGRATIONS,
  donate,
  points,
};
