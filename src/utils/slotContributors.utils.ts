import type { LotContributor } from '@models/slot.model';
import type { Purchase } from '@reducers/Purchases/Purchases';

export const getBidContributorName = (bid: Purchase): string | null => {
  const contributorName = bid.username?.trim();

  return contributorName || null;
};

export const addContributorAmount = (
  contributors: LotContributor[] | undefined,
  contributorName: string | null,
  amount: number,
): LotContributor[] => {
  if (!contributorName) {
    return contributors ?? [];
  }

  const nextContributors = contributors ?? [];
  const existingContributor = nextContributors.find((contributor) => contributor.name === contributorName);

  if (existingContributor) {
    return nextContributors.map((contributor) =>
      contributor.name === contributorName ? { ...contributor, amount: contributor.amount + amount } : contributor,
    );
  }

  return [...nextContributors, { name: contributorName, amount }];
};

export const getLeadingContributor = (contributors: LotContributor[] | undefined): LotContributor | null => {
  if (!contributors?.length) {
    return null;
  }

  return contributors.reduce((leadingContributor, contributor) =>
    contributor.amount > leadingContributor.amount ? contributor : leadingContributor,
  );
};

export const contributorsFromLegacyInvestors = (investors: string[] | undefined): LotContributor[] => {
  return (
    investors
      ?.map((investor) => investor.trim())
      .filter(Boolean)
      .map((name) => ({ name, amount: 0 })) ?? []
  );
};
