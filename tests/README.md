# Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end and visual regression testing.

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with visible browser
npm run test:headed

# Run tests with interactive UI
npm run test:ui

# Update baseline screenshots
npm run test:update
```

## Test Structure

```
tests/
├── toc.spec.ts              # TOC functional tests
├── visual.spec.ts           # Visual regression tests
├── visual.spec.ts-snapshots/ # Baseline screenshots
└── README.md                # This file
```

### TOC Functional Tests (`toc.spec.ts`)

Tests the Table of Contents functionality:
- Desktop: TOC visible by default, toggle open/close, link scrolling
- Mobile: TOC hidden by default, overlay behavior, auto-close on link click
- Active section highlighting during scroll
- State persistence in localStorage

### Visual Regression Tests (`visual.spec.ts`)

Screenshot comparisons for:
- Desktop layout (TOC open/closed)
- Tablet layout
- Mobile layout and overlay
- Light theme
- Overlap detection (TOC vs content)

## When to Run Tests

- After any CSS changes
- After modifying TOC component
- Before committing UI changes
- After updating dependencies

## Interpreting Results

**Passing tests:** All assertions met, screenshots match baselines.

**Failing screenshot tests:** Visual differences detected. Review the diff in `test-results/` directory. If the change is intentional, run `npm run test:update` to update baselines.

**Failing functional tests:** Check the error message and stack trace. Test reports are generated in `playwright-report/`.

## Troubleshooting

### Tests timeout
- Ensure dev server can start (`npm run dev`)
- Check if port 4321 is available

### Screenshot mismatches
- Different browsers may render differently
- Run `npm run test:update` to regenerate baselines
- Check if the change was intentional

### Element not found
- Check if selectors match current HTML structure
- Verify component is rendering correctly

## Device Coverage

Tests run on:
- Desktop Chrome
- Desktop Firefox
- Tablet (iPad Pro 11)
- Mobile (iPhone 14)
