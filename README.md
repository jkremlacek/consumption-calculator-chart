# Consumption Cost Chart

A lightweight Lovelace custom card for visualizing three Home Assistant electricity cost sensors over time using plain JavaScript and SVG.

## Features

- true 2D line chart with time on the X axis and cost on the Y axis
- supports three series simultaneously
- reads Home Assistant states and history for the selected time range
- updates when sensor values change
- no external chart library dependency
- installs as a custom Lovelace resource

## Sensors

The card expects entities like:

- `sensor.current_15min_cost`
- `sensor.current_shared_cost_15min`
- `sensor.current_grid_cost_15min`

## Card configuration

````yaml
type: custom:cost-chart-card
entities:
  - sensor.current_15min_cost
  - sensor.current_shared_cost_15min
  - sensor.current_grid_cost_15min
title: Electricity cost
hours: 24
decimals: 2
colors:
  - '#4fc3f7'
  - '#f9a825'
  - '#ef5350'
```;

## HACS install

This repo is structured to be compatible with HACS custom card installs.

1. Add this repository as a custom repository in HACS.
2. Install the card from the HACS UI.
3. Make sure the generated card file is included in the repo root or your release bundle.

The expected HACS metadata is defined in `hacs.json` and the card file produced by the build is `cost-chart-card.js`.

## Manual install

1. Build the bundle:

```bash
npm install
npm run build
````

2. Copy the generated file from `cost-chart-card.js` in the repo root, or from `dist/cost-chart-card.js`, to your Home Assistant frontend resource directory or a served static file location.

3. Add the file as a Lovelace resource in Home Assistant:
   - Settings > Dashboards > Resources
   - Add resource
   - URL: the location where you uploaded the bundle
   - Resource type: JavaScript Module

4. Reload the frontend and add the card using the YAML above.

## Development

```bash
npm run dev
```

This runs a local Vite dev server for iterating on the card while you test in a browser.

## Notes

- This repo is intentionally frontend-only and is meant to live outside the Python integration repo.
- History requests use the Home Assistant recorder API and normalize values to a common time axis before plotting.
