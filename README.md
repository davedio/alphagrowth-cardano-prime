# AlphaGrowth × Cardano PRIME

A dark-mode public information site for the AlphaGrowth Cardano PRIME governance action.

It combines:

- a source-grounded summary of the 12-month PRIME program;
- a public-source live readout of DRep Yes voting power in the hero;
- an alphabetized, roster-derived Cardano DeFi participant field whose visible count and layout expand as protocols are added;
- a July 20, 2026 snapshot of all 54 verified on-chain Yes votes, ordered by voting power;
- source-verified public profile images or organization marks for 40 of those DReps, with neutral monograms for unmatched identities;
- the eight public support posts supplied in the proposal appendix.

The public interface is static HTML, CSS, and JavaScript. One Vercel function reads the public AdaStat feed, with public GovTool and Koios fallbacks, so the hero percentage stays current without exposing credentials or relying on private sources.

## Sources

- [Official governance action](https://app.cgov.io/governance/529dccaadaa000746c22f1682574cb3f436eeba4d19710b90791a54226dc96d7%3A0)
- [AlphaGrowth](https://alphagrowth.io/)
- [Live vote tracker on AdaStat](https://adastat.net/governances/529dccaadaa000746c22f1682574cb3f436eeba4d19710b90791a54226dc96d700)
- [Midgard ecosystem partner assets](https://github.com/davedio/migard-new-imagery)
