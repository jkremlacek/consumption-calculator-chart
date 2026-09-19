# AGENTS

## Release/version rule

- Every commit that changes the card behavior or ships a new frontend bundle must also update the card version.
- Always bump both the package version in `package.json` and the runtime card version in `src/card.js`.
- Keep them aligned, e.g. `1.0.1`, `1.0.2`, etc.
- After updating the version, rebuild the bundle before finalizing the commit.

## Required workflow before commit

1. Update `src/card.js` `CARD_VERSION`.
2. Update `package.json` `version`.
3. Run `npm run build`.
4. Commit the source changes and generated bundle together.

## Current project note

This card is a Home Assistant custom card. The generated root bundle `cost-chart-card.js` is the file used by HACS/custom resource installs.
