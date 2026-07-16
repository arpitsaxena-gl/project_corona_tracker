# COVID-19 Tracker

### [Live Site](https://covid19statswebsite.netlify.com/)

![COVID-19 Tracker](https://i.ibb.co/X87BqVY/Screenshot-2020-04-13-at-10-14-58.png)

## Introduction

React COVID-19 dashboard demo using Charts.js and Material UI. Visitors pick **Global** or a country and see confirmed / recovered / deaths cards plus a chart.

## Setup

```bash
npm i
npm start
```

### Environment

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_COVID_API_BASE` | `https://disease.sh` | Public COVID REST provider base URL (no trailing slash). No secrets required. |

Copy `env.example` values into a local `.env` if you need to override the provider (or set the same variable in Netlify build settings).

## API provider

Data is loaded in the browser from `{REACT_APP_COVID_API_BASE}/v3/covid-19/...`:

- Global summary: `/all`
- Country summary: `/countries/{name}` (URL-encoded)
- Country list: `/countries`
- Global timeline: `/historical/all?lastdays=120`

UI DTOs remain `{ confirmed, recovered, deaths, lastUpdate }` so cards/charts stay stable if the provider base URL changes.

**Note:** The Global line chart uses **global** historical series (not the old US-only COVID Tracking series).

**Recovered display:** `null`/`undefined` → **N/A**; numeric `0` still shows `0`.

## Scripts

- `npm start` — CRA dev server
- `npm test` — Jest + Testing Library
- `npm run lint` — ESLint on `src`
- `npm run build` — production build to `build/`

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `build` (CRA). A later toolchain modernization may switch to Vite `dist/` — update Netlify then.

## Rollback

1. Revert the feature PR / git revert the adapter commit, **or**
2. Point `REACT_APP_COVID_API_BASE` back to a known-good provider and redeploy.

## Manual review before merge

1. Smoke-test disease.sh (or configured base) in a browser (CORS / rate limits).
2. Confirm Global timeline semantics (global historical vs old US daily).
3. Confirm recovered null → N/A policy.
4. Country names must match the provider list exactly (no free-typed aliases).
