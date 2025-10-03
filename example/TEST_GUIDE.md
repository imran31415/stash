# Playwright Test Guide for Stash

This guide explains how to run the automated Playwright tests for the Stash chat component library.

## Prerequisites

- Node.js v16+
- Yarn package manager
- Playwright installed

## Setup

### 1. Install Dependencies

```bash
cd example
yarn install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

This installs Chromium, Firefox, and WebKit browsers for testing.

## Running Tests

### Run All Tests (Headless)

```bash
yarn test
```

This will:
1. Start the mock server on port 8082
2. Start the example app on port 8083
3. Run all tests across multiple browsers
4. Generate an HTML report

### Run Tests in Headed Mode (See Browser)

```bash
yarn test:headed
```

Useful for debugging - you can watch the tests run in real browsers.

### Run Tests in UI Mode (Interactive)

```bash
yarn test:ui
```

Opens Playwright's interactive UI where you can:
- Run individual tests
- See test execution step-by-step
- Debug failures
- Time-travel through test execution

### View Test Report

After running tests:

```bash
yarn test:report
```

Opens the HTML report in your browser showing:
- Test results
- Screenshots of failures
- Execution traces
- Performance metrics

## Test Coverage

The test suite covers:

### User Chat Tests
- ✅ Loads initial messages
- ✅ Sends messages successfully
- ✅ Shows WebSocket connection status
- ✅ Displays message timestamps

### Group Chat Tests
- ✅ Loads group messages with multiple users
- ✅ Sends messages in group context
- ✅ Displays avatars for different users
- ✅ Handles typing indicators

### AI Chat Tests
- ✅ Loads AI welcome message
- ✅ Sends message and receives AI response
- ✅ Applies custom purple theme
- ✅ Simulates AI thinking/response delay

### Navigation Tests
- ✅ Switches between all tabs
- ✅ Preserves tab active state
- ✅ Maintains chat state per tab

### WebSocket Tests
- ✅ Establishes WebSocket connection
- ✅ Sends messages via WebSocket
- ✅ Receives messages in real-time
- ✅ Shows connection status

### Responsiveness Tests
- ✅ Works on mobile viewports (375x667)
- ✅ Works on tablet viewports (768x1024)
- ✅ Works on desktop viewports
- ✅ Adapts UI to different screen sizes

### Performance Tests
- ✅ Loads page within 3 seconds
- ✅ Handles multiple rapid messages
- ✅ Maintains smooth interactions

### Integration Tests
- ✅ Mock server responds correctly
- ✅ API endpoints work
- ✅ WebSocket endpoints work
- ✅ HTTP fallback works

## Test Structure

```
example/
├── tests/
│   └── chat.spec.ts          # Main test file
├── playwright.config.ts       # Playwright configuration
└── package.json              # Test scripts
```

## Running Specific Tests

### Run Only User Chat Tests

```bash
yarn test -g "User Chat"
```

### Run Only AI Chat Tests

```bash
yarn test -g "AI Chat"
```

### Run Only in Chromium

```bash
yarn test --project=chromium
```

### Run Only on Mobile

```bash
yarn test --project="Mobile Chrome"
```

## Debugging Failing Tests

### 1. Run in Headed Mode

```bash
yarn test:headed -g "name of failing test"
```

### 2. Use Playwright Inspector

```bash
PWDEBUG=1 yarn test -g "name of failing test"
```

This opens the Playwright Inspector where you can:
- Step through the test
- Pause execution
- Inspect elements
- View console logs

### 3. Check Screenshots

Failed tests automatically capture screenshots:
```
example/test-results/
└── <test-name>/
    └── test-failed-1.png
```

### 4. View Traces

After a test failure:
```bash
yarn test:report
```

Click on the failed test to see:
- Full execution trace
- Network activity
- Console logs
- Screenshots at each step

## Common Issues

### Port Already in Use

If port 8082 or 8083 is in use:

```bash
# Kill processes
lsof -ti:8082 | xargs kill -9
lsof -ti:8083 | xargs kill -9
```

### Mock Server Not Starting

Check if the server starts manually:
```bash
cd server
yarn start
```

If it fails, check:
- Dependencies installed: `yarn install`
- Port 8082 available
- No syntax errors in mock-server.js

### Tests Timeout

Increase timeout in playwright.config.ts:
```typescript
use: {
  timeout: 30000, // 30 seconds per test
}
```

### WebSocket Connection Fails

1. Verify mock server is running:
   ```bash
   curl http://localhost:8082/health
   ```

2. Check WebSocket URL in test logs

3. Verify no firewall blocking WebSocket

## CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd example
          yarn install
          cd server && yarn install && cd ..

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: cd example && yarn test

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: example/playwright-report/
```

## Test Best Practices

1. **Keep tests independent** - Each test should run in isolation
2. **Use data-testid** - Add test IDs to components for stable selectors
3. **Wait for elements** - Use `waitForSelector` instead of hard timeouts
4. **Mock external dependencies** - Don't rely on external APIs
5. **Clean up after tests** - Reset state between tests

## Writing New Tests

Example template:

```typescript
test('should do something', async ({ page }) => {
  // 1. Navigate
  await page.goto('/');

  // 2. Interact
  await page.click('text=Button');
  await page.fill('input', 'value');

  // 3. Assert
  await expect(page.locator('text=Result')).toBeVisible();
});
```

## Performance Testing

To measure performance:

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

## Visual Regression Testing

Add screenshot comparison:

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});
```

## Next Steps

- Add more test scenarios
- Implement visual regression tests
- Add accessibility tests (a11y)
- Set up CI/CD pipeline
- Add performance benchmarks

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For test-related issues:
1. Check test logs in console
2. Run tests in headed mode
3. Review screenshots and traces
4. Check mock server logs

Happy Testing! 🎭
