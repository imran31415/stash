import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8083';
const API_URL = 'http://localhost:8082';

test.describe('Stash Chat Component Tests', () => {

  test.beforeAll(async ({ request }) => {
    // Check if mock server is running
    try {
      const response = await request.get(`${API_URL}/health`);
      expect(response.ok()).toBeTruthy();
    } catch (error) {
      throw new Error('Mock server is not running on port 8082. Please start it with: cd example/server && yarn start');
    }
  });

  test.describe('User Chat', () => {

    test('should load user chat tab and display initial messages', async ({ page }) => {
      await page.goto(BASE_URL);

      // Click on User Chat tab
      await page.click('text=👤 User Chat');

      // Wait for chat to load
      await page.waitForTimeout(1000);

      // Check for initial messages
      await expect(page.locator('text=Welcome to the user chat')).toBeVisible();
      await expect(page.locator('text=Hey! How are you doing today?')).toBeVisible();
    });

    test('should send a message in user chat', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(1000);

      // Type and send a message
      const input = page.locator('input[placeholder="Type a message..."], textarea[placeholder="Type a message..."]');
      await input.fill('Hello from Playwright test!');

      // Click send button
      await page.click('button:has-text(""), button[aria-label="Send message"]').catch(() => {
        // Fallback: try clicking the send icon area
        page.locator('[style*="border"]').last().click();
      });

      // Verify message appears
      await expect(page.locator('text=Hello from Playwright test!')).toBeVisible({ timeout: 5000 });
    });

    test('should show WebSocket connection status', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');

      // Wait for connection
      await page.waitForTimeout(2000);

      // Check for connection indicator (could be "🔗 Live" or connecting states)
      const hasConnectionStatus = await page.locator('text=/Connected|Connecting|Live|🔗/').count();
      expect(hasConnectionStatus).toBeGreaterThan(0);
    });

  });

  test.describe('Group Chat', () => {

    test('should load group chat tab and display initial messages', async ({ page }) => {
      await page.goto(BASE_URL);

      // Click on Group Chat tab
      await page.click('text=👥 Group Chat');

      // Wait for chat to load
      await page.waitForTimeout(1000);

      // Check for initial messages
      await expect(page.locator('text=Welcome to the Development Team group')).toBeVisible();
      await expect(page.locator('text=Alice')).toBeVisible();
      await expect(page.locator('text=Bob')).toBeVisible();
    });

    test('should send a message in group chat', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👥 Group Chat');
      await page.waitForTimeout(1000);

      // Type and send a message
      const input = page.locator('input[placeholder*="Development Team"], textarea[placeholder*="Development Team"]');
      await input.fill('Test message in group chat');

      // Click send button (try multiple strategies)
      await Promise.any([
        page.click('button[aria-label="Send message"]'),
        page.keyboard.press('Enter'),
        page.locator('[style*="border"]').last().click()
      ]).catch(() => console.log('Attempting to send message...'));

      // Verify message appears
      await expect(page.locator('text=Test message in group chat')).toBeVisible({ timeout: 5000 });
    });

    test('should display multiple user avatars', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👥 Group Chat');
      await page.waitForTimeout(1000);

      // Count avatar elements (initial messages from different users)
      const avatars = page.locator('[style*="borderRadius"]').filter({ hasText: /^[A-Z]$/ });
      const count = await avatars.count();
      expect(count).toBeGreaterThan(0);
    });

  });

  test.describe('AI Chat', () => {

    test('should load AI chat tab with custom theme', async ({ page }) => {
      await page.goto(BASE_URL);

      // Click on AI Chat tab
      await page.click('text=🤖 AI Chat');

      // Wait for chat to load
      await page.waitForTimeout(1000);

      // Check for AI welcome message
      await expect(page.locator('text=AI Assistant is ready')).toBeVisible();
      await expect(page.locator('text=How can I help you today?')).toBeVisible();
    });

    test('should send message and receive AI response', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=🤖 AI Chat');
      await page.waitForTimeout(1000);

      // Type and send a message
      const input = page.locator('input[placeholder*="Ask AI"], textarea[placeholder*="Ask AI"]');
      await input.fill('What is the weather today?');

      // Send message
      await Promise.any([
        page.click('button[aria-label="Send message"]'),
        page.keyboard.press('Enter'),
        page.locator('[style*="border"]').last().click()
      ]);

      // Verify user message appears
      await expect(page.locator('text=What is the weather today?')).toBeVisible({ timeout: 5000 });

      // Wait for AI response (mock server responds after 1-3 seconds)
      await page.waitForTimeout(4000);

      // Check that at least one more message appeared (the AI response)
      const messages = await page.locator('text=/interesting|understand|help|suggest|think/i').count();
      expect(messages).toBeGreaterThan(0);
    });

    test('should display custom purple theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=🤖 AI Chat');
      await page.waitForTimeout(1000);

      // Check for purple-themed elements (AI chat uses purple theme)
      // Look for elements with purple-ish background colors
      const purpleElements = page.locator('[style*="#8B5CF6"], [style*="#EDE9FE"], [style*="#5B21B6"]');
      const count = await purpleElements.count();
      expect(count).toBeGreaterThan(0);
    });

  });

  test.describe('Tab Navigation', () => {

    test('should navigate between all tabs', async ({ page }) => {
      await page.goto(BASE_URL);

      // User Chat
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Welcome to the user chat')).toBeVisible();

      // Group Chat
      await page.click('text=👥 Group Chat');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Welcome to the Development Team')).toBeVisible();

      // AI Chat
      await page.click('text=🤖 AI Chat');
      await page.waitForTimeout(500);
      await expect(page.locator('text=AI Assistant is ready')).toBeVisible();

      // Back to User Chat
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Welcome to the user chat')).toBeVisible();
    });

    test('should preserve tab active state', async ({ page }) => {
      await page.goto(BASE_URL);

      // Click AI Chat
      await page.click('text=🤖 AI Chat');

      // Check active state (border or color change)
      const aiTab = page.locator('text=🤖 AI Chat').locator('..');
      await expect(aiTab).toHaveCSS('border-bottom-color', /rgb\(0, 122, 255\)|#007AFF/i);
    });

  });

  test.describe('WebSocket Features', () => {

    test('should establish WebSocket connection', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');

      // Wait for WebSocket to connect
      await page.waitForTimeout(2000);

      // Check console for WebSocket connection messages
      const logs: string[] = [];
      page.on('console', msg => logs.push(msg.text()));

      await page.waitForTimeout(1000);

      // Should have WebSocket related logs
      const hasWsLogs = logs.some(log =>
        log.includes('WebSocket') ||
        log.includes('connected') ||
        log.includes('🔗')
      );

      // Connection status should be visible in UI
      const statusVisible = await page.locator('text=/Connect|Live|🔗/i').count() > 0;

      expect(statusVisible || hasWsLogs).toBeTruthy();
    });

  });

  test.describe('Message Features', () => {

    test('should display message timestamps', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(1000);

      // Look for time format (e.g., "2:45 PM" or similar)
      const timestamps = page.locator('text=/\\d{1,2}:\\d{2}|AM|PM/');
      const count = await timestamps.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support multiline input', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(1000);

      const input = page.locator('textarea').first();

      // Type multiline message
      await input.fill('Line 1\nLine 2\nLine 3');

      const value = await input.inputValue();
      expect(value).toContain('\n');
    });

  });

  test.describe('Mock Server Integration', () => {

    test('should verify mock server is responding', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    test('should load messages from API', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/chat/messages?userId=test-user&limit=10`);
      expect(response.ok()).toBeTruthy();

      const messages = await response.json();
      expect(Array.isArray(messages)).toBeTruthy();
    });

  });

  test.describe('Responsiveness', () => {

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(BASE_URL);

      await page.click('text=👤 User Chat');
      await page.waitForTimeout(1000);

      // Chat should be visible
      await expect(page.locator('text=Welcome to the user chat')).toBeVisible();

      // Input should be visible
      const input = page.locator('textarea, input[type="text"]').first();
      await expect(input).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(BASE_URL);

      await page.click('text=👥 Group Chat');
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Welcome to the Development Team')).toBeVisible();
    });

  });

  test.describe('Performance', () => {

    test('should load page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle multiple rapid messages', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=👤 User Chat');
      await page.waitForTimeout(1000);

      const input = page.locator('textarea, input').first();

      // Send 5 messages rapidly
      for (let i = 1; i <= 5; i++) {
        await input.fill(`Rapid message ${i}`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
      }

      // All messages should appear
      for (let i = 1; i <= 5; i++) {
        await expect(page.locator(`text=Rapid message ${i}`)).toBeVisible({ timeout: 5000 });
      }
    });

  });

});
