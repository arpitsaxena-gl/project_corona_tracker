# COVID-19 Tracker

### [Live Site](https://covid19statswebsite.netlify.com/)

![COVID-19 Tracker](https://i.ibb.co/X87BqVY/Screenshot-2020-04-13-at-10-14-58.png)

## Introduction

React COVID-19 dashboard using Charts.js and Material UI.

Primary statistics provider: [disease.sh](https://disease.sh/) (`/v3/covid-19`). The global line chart still uses the COVID Tracking Project **US historical daily** archive and is labeled as such in the UI.

## Setup

```bash
npm i && npm start
```

### Environment (optional)

Copy `.env.example` to `.env`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `REACT_APP_COVID_API_BASE` | `https://disease.sh/v3/covid-19` | Primary COVID stats + countries API base |
| `REACT_APP_US_DAILY_URL` | `https://api.covidtracking.com/v1/us/daily.json` | US historical daily JSON for the line chart |

## Tests

```bash
CI=true npm test -- --watchAll=false
```

## Troubleshooting

- If cards fail to load, confirm `REACT_APP_COVID_API_BASE/all` returns HTTP 200 in the browser.
- Failed loads show an on-screen error banner with Retry; metrics state never stores a raw `Error` object.
