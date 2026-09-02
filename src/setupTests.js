// CRA (react-scripts) auto-loads this file before the test suite.
// Redmine #16 — COVID Tracker Reliability & Data-Safety Hardening (Test Gen, step 6).

// jest-dom custom matchers (toBeInTheDocument, toBeDisabled, ...).
import '@testing-library/jest-dom/extend-expect';

// The jsdom bundled with react-scripts 3.x has no AbortController, but useAsync
// and App both construct one. Provide a minimal, deterministic polyfill so the
// cancellation paths (analysis P5) are exercisable in tests without a network.
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      };
    }

    abort() {
      this.signal.aborted = true;
    }
  };
}
