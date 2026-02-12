# Specification

## Summary
**Goal:** Build the “Wooden Spoon” memecoin on ICP with a single Motoko canister implementing a fungible token plus token-weighted DAO governance, and a React UI using Internet Identity to manage tokens and governance.

**Planned changes:**
- Implement a Motoko fungible token canister: metadata (name/symbol/decimals), total supply, per-principal balances, and caller-to-recipient transfers with validation and upgrade-safe stable storage.
- Add token-weighted DAO governance in the same canister: create proposals (with title/description/timestamps and an action payload), list/fetch proposals, vote once per principal (yes/no/abstain) with weight = balance at time of vote, enforce deadlines/status transitions, quorum/threshold rules, and upgrade-safe stable storage.
- Implement a DAO treasury balance controlled by the canister, expose treasury balance queries, and support executing accepted “treasury transfer” proposals on-chain (move tokens from treasury and mark executed).
- Build a React frontend with Internet Identity: connect/disconnect, show principal, show token balance, transfer tokens, create/browse/view proposals, vote, and execute accepted treasury-transfer proposals with clear validation/messaging.
- Apply a consistent “Wooden Spoon” visual theme (playful DIY/wood textures, meme-coin energy; avoid default blue/purple palettes) across the UI.
- Add generated static branding images under `frontend/public/assets/generated` and render them in the header/landing and as a token/DAO emblem.

**User-visible outcome:** Users can log in with Internet Identity, view and transfer Wooden Spoon tokens, create and vote on DAO proposals (token = vote), see proposal status/totals, view the DAO treasury balance, and execute accepted treasury-transfer proposals from the UI.
