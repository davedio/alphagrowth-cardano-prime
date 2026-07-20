const ADASTAT_API_URL = "https://adastat.net/api/rest/v1/governances/529dccaadaa000746c22f1682574cb3f436eeba4d19710b90791a54226dc96d700.json?currency=usd";
const ADASTAT_PAGE_URL = "https://adastat.net/governances/529dccaadaa000746c22f1682574cb3f436eeba4d19710b90791a54226dc96d700";

function toBigInt(value, field) {
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return BigInt(value);
  throw new TypeError(`Invalid ${field}`);
}

function toVoteCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.setHeader("Cache-Control", "no-store");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const upstream = await fetch(ADASTAT_API_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AlphaGrowth-Cardano-PRIME/1.0 (+https://alphagrowth-cardano-prime.vercel.app)",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!upstream.ok) throw new Error(`AdaStat returned ${upstream.status}`);

    const data = await upstream.json();
    const yesStake = toBigInt(data.drep_yes_stake, "drep_yes_stake");
    const totalStake = toBigInt(data.drep_total_stake, "drep_total_stake");
    const abstainStake = toBigInt(data.drep_abstain_stake, "drep_abstain_stake");
    const alwaysAbstainStake = toBigInt(data.drep_always_abstain_stake, "drep_always_abstain_stake");
    const inactiveStake = toBigInt(data.drep_inactive_stake, "drep_inactive_stake");
    const excludedStake = abstainStake + alwaysAbstainStake + inactiveStake;
    const eligibleVotingStake = totalStake - excludedStake;

    if (eligibleVotingStake <= 0n || yesStake > eligibleVotingStake) {
      throw new RangeError("AdaStat returned inconsistent voting stake");
    }

    const percentageHundredths = (yesStake * 10_000n + eligibleVotingStake / 2n) / eligibleVotingStake;
    const yesPercent = Number(percentageHundredths) / 100;
    const yesVotes = toVoteCount(data.drep_vote_yes ?? data.drep_yes);
    const noVotes = toVoteCount(data.drep_vote_no ?? data.drep_no);
    const abstainVotes = toVoteCount(data.drep_vote_abstain ?? data.drep_abstain);

    response.setHeader("Cache-Control", "public, s-maxage=45, stale-while-revalidate=300");
    return response.status(200).json({
      yesPercent,
      yesVotes,
      noVotes,
      abstainVotes,
      yesStake: yesStake.toString(),
      eligibleVotingStake: eligibleVotingStake.toString(),
      source: "AdaStat",
      sourceUrl: ADASTAT_PAGE_URL,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).json({ error: "Live vote feed unavailable" });
  } finally {
    clearTimeout(timeout);
  }
};
