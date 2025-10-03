import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message, User } from '../../src/components/Chat';
import { addMinutes, addSeconds } from 'date-fns';
import type { TimeSeriesSeries, TimeSeriesDataPoint } from '../../src/components/Chat/InteractiveComponents';

// Participants
const OPS_TEAM: User = {
  id: 'user-ops',
  name: 'DevOps Team',
};

const SYSTEM_AI: User = {
  id: 'ai-monitor',
  name: 'System Monitor AI',
};

const ENGINEER: User = {
  id: 'user-engineer',
  name: 'Senior Engineer',
};

// System Metrics Simulator for live dashboard
class SystemMetricsSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: MetricUpdate) => void> = new Map();
  private isRunning = false;
  private updateFrequency = 2000; // 2 seconds

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      const metrics = this.generateMetrics();
      this.notifySubscribers(metrics);
    }, this.updateFrequency);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  subscribe(id: string, callback: (data: MetricUpdate) => void) {
    this.subscribers.set(id, callback);
    return () => {
      this.subscribers.delete(id);
    };
  }

  private generateMetrics(): MetricUpdate {
    const now = new Date();
    // Generate realistic system metrics that fluctuate
    return {
      timestamp: now,
      cpu: 45 + Math.random() * 10, // 45-55%
      memory: 55 + Math.random() * 8, // 55-63%
      responseTime: 120 + Math.random() * 30, // 120-150ms
      errorRate: 5 + Math.random() * 3, // 5-8 errors/min
    };
  }

  private notifySubscribers(metrics: MetricUpdate) {
    this.subscribers.forEach(callback => callback(metrics));
  }
}

interface MetricUpdate {
  timestamp: Date;
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
}

// Helper to create incident messages
const createIncidentMessages = (): Message[] => {
  // Start timestamp: 5 minutes ago
  const startTime = new Date(Date.now() - 300000);

  return [
    // 1. Initial Alert
    {
      id: 'incident-001',
      type: 'text',
      content: 'CRITICAL ALERT: Redis cache cluster showing massive spike in connection errors. Database query latency up 2000%. Multiple services reporting timeouts.',
      sender: OPS_TEAM,
      timestamp: startTime,
      status: 'delivered',
      isOwn: false,
    },

    // 2. Dashboard - Critical System Metrics (Live Streaming)
    {
      id: 'incident-002',
      type: 'text',
      content: 'System health dashboard shows critical degradation across all metrics:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 0.5),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'dashboard',
        data: {
          config: {
            title: 'Critical System Metrics',
            description: 'Real-time system performance - DEGRADED',
            gridSize: '2x2',
            items: [
              {
                id: 'cpu-chart',
                type: 'time-series',
                title: 'CPU Usage (%)',
                gridPosition: { row: 0, col: 0 },
                data: {
                  series: [
                    {
                      id: 'cpu',
                      name: 'CPU',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 45 + Math.random() * 10,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 52 },
                        { timestamp: addMinutes(startTime, 0.5), value: 98 },
                      ],
                      color: '#EF4444',
                    },
                  ],
                  enableLiveStreaming: true,
                  maxDataPoints: 20,
                  streamingWindowSize: 20,
                  showLegend: false,
                  showGrid: true,
                  height: 150,
                },
              },
              {
                id: 'memory-chart',
                type: 'time-series',
                title: 'Memory Usage (%)',
                gridPosition: { row: 0, col: 1 },
                data: {
                  series: [
                    {
                      id: 'memory',
                      name: 'Memory',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 55 + Math.random() * 8,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 60 },
                        { timestamp: addMinutes(startTime, 0.5), value: 95 },
                      ],
                      color: '#F59E0B',
                    },
                  ],
                  enableLiveStreaming: true,
                  maxDataPoints: 20,
                  streamingWindowSize: 20,
                  showLegend: false,
                  showGrid: true,
                  height: 150,
                },
              },
              {
                id: 'response-chart',
                type: 'time-series',
                title: 'API Response (ms)',
                gridPosition: { row: 1, col: 0 },
                data: {
                  series: [
                    {
                      id: 'api-response',
                      name: 'Response Time',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 120 + Math.random() * 30,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 150 },
                        { timestamp: addMinutes(startTime, 0.5), value: 3500 },
                      ],
                      color: '#8B5CF6',
                    },
                  ],
                  enableLiveStreaming: true,
                  maxDataPoints: 20,
                  streamingWindowSize: 20,
                  showLegend: false,
                  showGrid: true,
                  height: 150,
                },
              },
              {
                id: 'errors-chart',
                type: 'time-series',
                title: 'Error Rate (/min)',
                gridPosition: { row: 1, col: 1 },
                data: {
                  series: [
                    {
                      id: 'errors',
                      name: 'Errors',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 5 + Math.random() * 3,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 8 },
                        { timestamp: addMinutes(startTime, 0.5), value: 450 },
                      ],
                      color: '#DC2626',
                    },
                  ],
                  enableLiveStreaming: true,
                  maxDataPoints: 20,
                  streamingWindowSize: 20,
                  showLegend: false,
                  showGrid: true,
                  height: 150,
                },
              },
            ],
          },
          mode: 'mini',
          height: 400,
        },
      },
    },

    {
      id: 'incident-002b',
      type: 'text',
      content: 'Health Check Status: CRITICAL - Primary database responding slowly, cache layer completely down.',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 0.75),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'health-check',
              name: 'Health Check Status',
              data: [
                ...Array.from({ length: 10 }, (_, i) => ({
                  timestamp: addMinutes(startTime, -10 + i),
                  value: 1, // GREEN = 1
                  label: 'HEALTHY',
                })),
                { timestamp: addMinutes(startTime, 0), value: 0.5, label: 'DEGRADED' },
                { timestamp: addMinutes(startTime, 0.5), value: 0, label: 'CRITICAL' },
                { timestamp: addMinutes(startTime, 0.75), value: 0, label: 'CRITICAL' },
              ],
              color: '#EF4444',
              lineWidth: 4,
              showPoints: true,
              pointRadius: 6,
            },
          ],
          mode: 'full',
          title: 'Health Check Monitor',
          subtitle: 'Status: CRITICAL (RED)',
          showLegend: false,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Status',
          valueFormatter: (value: number) => {
            if (value >= 0.8) return 'HEALTHY';
            if (value >= 0.4) return 'DEGRADED';
            return 'CRITICAL';
          },
          height: 200,
          minY: 0,
          maxY: 1,
        },
      },
    },

    // 3. Root Cause Analysis
    {
      id: 'incident-003',
      type: 'text',
      content: 'What happened? I need root cause analysis NOW.',
      sender: OPS_TEAM,
      timestamp: addMinutes(startTime, 1),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-004',
      type: 'text',
      content: 'ROOT CAUSE IDENTIFIED: Classic Thundering Herd Problem\n\n**Timeline:**\n- T-0: Redis cache TTL expired for product catalog key at 14:23:47 UTC\n- T+0.1s: All 10,000 application servers detected cache miss simultaneously\n- T+0.2s: 10,000 concurrent database queries initiated for same data\n- T+0.5s: Database connection pool exhausted (max 500 connections)\n- T+1s: Database CPU spiked to 98%, query latency increased 20x\n- T+2s: Cascade failure - API timeouts, health checks failing\n\n**The Problem:**\nWithout rate limiting or cache stampede protection, all servers rushed to repopulate the cache at once. The database couldn\'t handle 10,000 simultaneous queries for the same data.\n\n**Impact:**\n- Database: 10,000 redundant queries\n- Connection pool: 100% exhausted\n- Response time: 150ms → 3500ms (2,233% increase)\n- Error rate: 0% → 42%\n- Affected users: ~150,000 active sessions',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 1.5),
      status: 'delivered',
      isOwn: false,
    },

    // 4. Task List - Incident Response
    {
      id: 'incident-005',
      type: 'text',
      content: 'Generating incident response action plan...',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          title: 'Incident Response Tasks',
          subtitle: 'Priority-ordered remediation steps',
          tasks: [
            {
              id: 'task-1',
              title: 'IMMEDIATE: Restart cache cluster',
              description: 'Clear corrupted cache state and restore cache availability',
              startDate: addMinutes(startTime, 2),
              endDate: addMinutes(startTime, 3),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-2',
              title: 'IMMEDIATE: Enable database read replicas',
              description: 'Distribute load across read replicas to reduce primary DB pressure',
              startDate: addMinutes(startTime, 2.5),
              endDate: addMinutes(startTime, 3.5),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-3',
              title: 'SHORT TERM: Deploy cache stampede protection',
              description: 'Implement probabilistic early expiration and request coalescing',
              startDate: addMinutes(startTime, 3),
              endDate: addMinutes(startTime, 10),
              progress: 60,
              status: 'in-progress',
              priority: 'high',
              assignee: 'Senior Engineer',
            },
            {
              id: 'task-4',
              title: 'SHORT TERM: Add rate limiting to cache refresh',
              description: 'Limit concurrent cache refresh operations per key',
              startDate: addMinutes(startTime, 5),
              endDate: addMinutes(startTime, 12),
              progress: 30,
              status: 'in-progress',
              priority: 'high',
              assignee: 'Senior Engineer',
            },
            {
              id: 'task-5',
              title: 'MONITORING: Verify system recovery',
              description: 'Monitor all metrics return to healthy baselines',
              startDate: addMinutes(startTime, 10),
              endDate: addMinutes(startTime, 15),
              progress: 0,
              status: 'pending',
              priority: 'high',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-6',
              title: 'POST-INCIDENT: Write postmortem',
              description: 'Document incident timeline, root cause, and prevention measures',
              startDate: addMinutes(startTime, 20),
              endDate: addMinutes(startTime, 60),
              progress: 0,
              status: 'pending',
              priority: 'medium',
              assignee: 'Senior Engineer',
            },
          ],
          mode: 'mini',
          showProgress: true,
        },
      },
    },

    // 5. Code Block - Buggy Implementation
    {
      id: 'incident-006',
      type: 'text',
      content: 'Show me the problematic code.',
      sender: ENGINEER,
      timestamp: addMinutes(startTime, 3),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-007',
      type: 'text',
      content: 'Here is the current implementation causing the thundering herd:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 3.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// BUGGY CODE - No stampede protection
class ProductCatalogService {
  private cache: RedisClient;
  private db: DatabaseClient;
  private CACHE_TTL = 3600; // 1 hour

  async getProductCatalog(): Promise<Product[]> {
    const cacheKey = 'product_catalog';

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // PROBLEM: When cache expires, ALL 10,000 servers
    // hit this code path simultaneously
    console.log('Cache miss - fetching from database');

    // PROBLEM: No rate limiting or coordination
    // All servers query the DB at the same time
    const products = await this.db.query(
      'SELECT * FROM products WHERE active = true'
    );

    // PROBLEM: All servers try to set cache simultaneously
    await this.cache.set(
      cacheKey,
      JSON.stringify(products),
      'EX',
      this.CACHE_TTL
    );

    return products;
  }
}

// What happens when cache expires:
// 1. Request comes in to server #1
// 2. Cache miss → query database
// 3. Request comes in to server #2 (0.001s later)
// 4. Cache STILL empty → query database
// 5. Repeat 9,998 more times
// 6. Database receives 10,000 identical queries
// 7. Connection pool exhausted
// 8. System-wide failure`,
          language: 'typescript',
          fileName: 'ProductCatalogService.ts (BEFORE)',
          mode: 'preview',
          showLineNumbers: true,
        },
      },
    },

    // 6. Code Block - Fixed Implementation
    {
      id: 'incident-008',
      type: 'text',
      content: 'Here is the fixed implementation with stampede protection and rate limiting:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 3.5),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// FIXED CODE - Multiple layers of protection
import { RateLimiter } from 'rate-limiter-flexible';
import { promisify } from 'util';

class ProductCatalogService {
  private cache: RedisClient;
  private db: DatabaseClient;
  private CACHE_TTL = 3600; // 1 hour
  private EARLY_EXPIRATION_WINDOW = 60; // 60 seconds before expiration

  // In-flight request tracking (prevents duplicate DB calls)
  private inflightRequests = new Map<string, Promise<any>>();

  // Rate limiter: max 10 cache refresh operations per minute
  private rateLimiter = new RateLimiter({
    points: 10,
    duration: 60,
    keyPrefix: 'cache_refresh',
  });

  async getProductCatalog(): Promise<Product[]> {
    const cacheKey = 'product_catalog';

    // Try cache first
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      const { data, cachedAt } = JSON.parse(cachedData);

      // SOLUTION 1: Probabilistic Early Expiration
      // Refresh cache probabilistically before it expires
      // to prevent all servers from missing cache simultaneously
      const age = Date.now() - cachedAt;
      const timeUntilExpiry = this.CACHE_TTL * 1000 - age;

      if (timeUntilExpiry < this.EARLY_EXPIRATION_WINDOW * 1000) {
        // Probabilistic refresh: higher probability as expiry approaches
        const refreshProbability = 1 - (timeUntilExpiry / (this.EARLY_EXPIRATION_WINDOW * 1000));

        if (Math.random() < refreshProbability) {
          // Refresh in background, return stale data immediately
          this.refreshCacheInBackground(cacheKey).catch(err => {
            console.error('Background cache refresh failed:', err);
          });
        }
      }

      return data;
    }

    // Cache miss - need to fetch from database
    return this.fetchAndCacheProducts(cacheKey);
  }

  private async fetchAndCacheProducts(cacheKey: string): Promise<Product[]> {
    // SOLUTION 2: Request Coalescing
    // If another request is already fetching, wait for it instead
    // of making a duplicate database query
    if (this.inflightRequests.has(cacheKey)) {
      console.log('Coalescing request - waiting for in-flight fetch');
      return this.inflightRequests.get(cacheKey)!;
    }

    // SOLUTION 3: Rate Limiting
    // Ensure we don't overwhelm the database even if cache fails
    try {
      await this.rateLimiter.consume(cacheKey);
    } catch (rateLimitError) {
      // Rate limit exceeded - return stale data or error gracefully
      console.warn('Cache refresh rate limit exceeded');
      throw new Error('Service temporarily unavailable - rate limit exceeded');
    }

    // Create the fetch promise and track it
    const fetchPromise = this.doFetchProducts(cacheKey);
    this.inflightRequests.set(cacheKey, fetchPromise);

    try {
      const products = await fetchPromise;
      return products;
    } finally {
      // Clean up in-flight tracking
      this.inflightRequests.delete(cacheKey);
    }
  }

  private async doFetchProducts(cacheKey: string): Promise<Product[]> {
    console.log('Fetching from database (cache miss)');

    const products = await this.db.query(
      'SELECT * FROM products WHERE active = true'
    );

    // Store with timestamp for early expiration logic
    const cacheValue = {
      data: products,
      cachedAt: Date.now(),
    };

    // SOLUTION 4: Add jitter to TTL
    // Prevent all cache entries from expiring simultaneously
    const jitter = Math.floor(Math.random() * 60); // 0-60 seconds
    const ttlWithJitter = this.CACHE_TTL + jitter;

    await this.cache.set(
      cacheKey,
      JSON.stringify(cacheValue),
      'EX',
      ttlWithJitter
    );

    return products;
  }

  private async refreshCacheInBackground(cacheKey: string): Promise<void> {
    // Non-blocking background refresh
    return this.fetchAndCacheProducts(cacheKey).then(() => {
      console.log('Background cache refresh completed');
    });
  }
}

// How the fixed version prevents thundering herd:
// 1. Probabilistic early expiration: Cache refreshes before expiring
// 2. Request coalescing: Only one DB query per cache key
// 3. Rate limiting: Maximum 10 refreshes per minute
// 4. TTL jitter: Cache entries expire at different times
//
// Result: 10,000 requests → 1 database query`,
          language: 'typescript',
          fileName: 'ProductCatalogService.ts (AFTER - FIXED)',
          mode: 'preview',
          showLineNumbers: true,
        },
      },
    },

    // 7. Gantt Chart - Rollout Timeline
    {
      id: 'incident-009',
      type: 'text',
      content: 'I need a deployment timeline for rolling out this fix.',
      sender: OPS_TEAM,
      timestamp: addMinutes(startTime, 5),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-010',
      type: 'text',
      content: 'Here is the phased rollout plan to minimize risk:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 5.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          title: 'Fix Deployment Timeline',
          subtitle: 'Phased rollout with monitoring gates',
          tasks: [
            {
              id: 'rollout-1',
              title: 'Code Review & Testing',
              description: 'Peer review, unit tests, integration tests',
              startDate: addMinutes(startTime, 5),
              endDate: addMinutes(startTime, 15),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'Senior Engineer',
              color: '#10B981',
            },
            {
              id: 'rollout-2',
              title: 'Deploy to Staging',
              description: 'Deploy to staging environment, run load tests',
              startDate: addMinutes(startTime, 15),
              endDate: addMinutes(startTime, 25),
              progress: 100,
              status: 'completed',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-1'],
              color: '#10B981',
            },
            {
              id: 'rollout-3',
              title: 'Canary Deployment (1% traffic)',
              description: 'Deploy to 1% of production servers, monitor metrics',
              startDate: addMinutes(startTime, 25),
              endDate: addMinutes(startTime, 40),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
              dependencies: ['rollout-2'],
              color: '#10B981',
              milestones: [
                {
                  id: 'm1',
                  title: 'Canary Success',
                  date: addMinutes(startTime, 40),
                  completed: true,
                },
              ],
            },
            {
              id: 'rollout-4',
              title: 'Gradual Rollout (10% → 50%)',
              description: 'Increase to 10%, monitor 15min, then 50%',
              startDate: addMinutes(startTime, 40),
              endDate: addMinutes(startTime, 70),
              progress: 100,
              status: 'completed',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-3'],
              color: '#10B981',
            },
            {
              id: 'rollout-5',
              title: 'Full Deployment (100%)',
              description: 'Deploy to all production servers',
              startDate: addMinutes(startTime, 70),
              endDate: addMinutes(startTime, 90),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
              dependencies: ['rollout-4'],
              color: '#10B981',
              milestones: [
                {
                  id: 'm2',
                  title: 'Full Deployment Complete',
                  date: addMinutes(startTime, 90),
                  completed: true,
                },
              ],
            },
            {
              id: 'rollout-6',
              title: 'Post-Deployment Monitoring',
              description: 'Monitor metrics for 2 hours to ensure stability',
              startDate: addMinutes(startTime, 90),
              endDate: addMinutes(startTime, 210),
              progress: 45,
              status: 'in-progress',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-5'],
              color: '#3B82F6',
            },
          ],
          mode: 'mini',
          showProgress: true,
          showMilestones: true,
        },
      },
    },

    // 8. Final Dashboard - Healthy Metrics with Live Streaming
    {
      id: 'incident-011',
      type: 'text',
      content: 'Deployment complete. Monitoring system recovery...',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 90),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-012',
      type: 'text',
      content: 'All systems returning to healthy state. Real-time health monitoring shows GREEN:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 95),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'health-check-recovery',
              name: 'Health Check Status',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 0.3, label: 'RECOVERING' },
                { timestamp: addMinutes(startTime, 91), value: 0.6, label: 'DEGRADED' },
                { timestamp: addMinutes(startTime, 92), value: 0.85, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 93), value: 1, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 94), value: 1, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 95), value: 1, label: 'HEALTHY' },
              ],
              color: '#10B981',
              lineWidth: 4,
              showPoints: true,
              pointRadius: 6,
            },
          ],
          mode: 'full',
          title: 'Live Health Monitor - SYSTEM HEALTHY',
          subtitle: 'Status: HEALTHY (GREEN) - Streaming every 2 seconds',
          enableLiveStreaming: true,
          maxDataPoints: 50,
          streamingWindowSize: 30,
          showStreamingControls: true,
          streamingPaused: false,
          streamingCallbackId: 'health-monitor-stream',
          showLegend: false,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Status',
          valueFormatter: (value: number) => {
            if (value >= 0.8) return 'HEALTHY';
            if (value >= 0.4) return 'DEGRADED';
            return 'CRITICAL';
          },
          height: 250,
          minY: 0,
          maxY: 1,
        },
      },
    },

    {
      id: 'incident-013',
      type: 'text',
      content: 'Performance metrics stabilized:',
      sender: SYSTEM_AI,
      timestamp: addMinutes(startTime, 96),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'cpu-recovery',
              name: 'CPU Usage (%)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 78 },
                { timestamp: addMinutes(startTime, 91), value: 65 },
                { timestamp: addMinutes(startTime, 92), value: 52 },
                { timestamp: addMinutes(startTime, 93), value: 48 },
                { timestamp: addMinutes(startTime, 94), value: 45 },
                { timestamp: addMinutes(startTime, 95), value: 47 },
                { timestamp: addMinutes(startTime, 96), value: 46 },
              ],
              color: '#10B981',
              lineWidth: 3,
            },
            {
              id: 'memory-recovery',
              name: 'Memory Usage (%)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 82 },
                { timestamp: addMinutes(startTime, 91), value: 72 },
                { timestamp: addMinutes(startTime, 92), value: 65 },
                { timestamp: addMinutes(startTime, 93), value: 62 },
                { timestamp: addMinutes(startTime, 94), value: 60 },
                { timestamp: addMinutes(startTime, 95), value: 59 },
                { timestamp: addMinutes(startTime, 96), value: 58 },
              ],
              color: '#3B82F6',
              lineWidth: 3,
            },
            {
              id: 'api-recovery',
              name: 'API Response Time (ms)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 850 },
                { timestamp: addMinutes(startTime, 91), value: 420 },
                { timestamp: addMinutes(startTime, 92), value: 250 },
                { timestamp: addMinutes(startTime, 93), value: 180 },
                { timestamp: addMinutes(startTime, 94), value: 145 },
                { timestamp: addMinutes(startTime, 95), value: 138 },
                { timestamp: addMinutes(startTime, 96), value: 132 },
              ],
              color: '#8B5CF6',
              lineWidth: 3,
            },
          ],
          mode: 'full',
          title: 'System Performance Recovery',
          subtitle: 'All metrics within normal operating ranges',
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Value',
          height: 300,
        },
      },
    },

    // 9. Engineer Confirmation
    {
      id: 'incident-014',
      type: 'text',
      content: 'Confirmed. All systems healthy. Database query count reduced from 10,000 to 1 per cache refresh. Response times back to baseline. Incident resolved.\n\n**Incident Summary:**\n- Duration: 95 minutes\n- Root Cause: Thundering herd on cache expiration\n- Impact: 150,000 users affected\n- Resolution: Implemented stampede protection with request coalescing, rate limiting, and probabilistic early expiration\n- Prevention: Added monitoring alerts for cache miss rate and database connection pool exhaustion\n\nAll systems healthy. Incident closed.',
      sender: ENGINEER,
      timestamp: addMinutes(startTime, 98),
      status: 'delivered',
      isOwn: false,
    },
  ];
};

const ThunderingHerdIncidentExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => createIncidentMessages());
  const simulatorRef = useRef<SystemMetricsSimulator | null>(null);

  // Initialize simulator
  useEffect(() => {
    simulatorRef.current = new SystemMetricsSimulator();

    // Subscribe to metric updates
    const unsubscribe = simulatorRef.current.subscribe('dashboard-metrics', (metrics) => {
      console.log('[ThunderingHerd] Received metrics update:', metrics);
      setMessages(prevMessages => {
        // Create completely new array with new objects for React to detect change
        const newMessages = [...prevMessages];

        const dashboardMsgIndex = newMessages.findIndex(
          msg => msg.id === 'incident-002' && msg.interactiveComponent?.type === 'dashboard'
        );

        if (dashboardMsgIndex !== -1) {
          console.log('[ThunderingHerd] Updating dashboard data...');
          const msg = newMessages[dashboardMsgIndex];
          const dashboardData = msg.interactiveComponent!.data;

          // Create completely new items array
          const updatedItems = dashboardData.config.items.map((item: any) => {
            if (item.id === 'cpu-chart') {
              const newData = [
                ...item.data.series[0].data.slice(-19),
                { timestamp: metrics.timestamp, value: metrics.cpu }
              ];
              console.log('[ThunderingHerd] CPU data points:', newData.length, 'latest:', metrics.cpu);
              return {
                ...item,
                data: {
                  ...item.data,
                  series: [{
                    ...item.data.series[0],
                    data: newData
                  }]
                }
              };
            }
            if (item.id === 'memory-chart') {
              return {
                ...item,
                data: {
                  ...item.data,
                  series: [{
                    ...item.data.series[0],
                    data: [
                      ...item.data.series[0].data.slice(-19),
                      { timestamp: metrics.timestamp, value: metrics.memory }
                    ]
                  }]
                }
              };
            }
            if (item.id === 'response-chart') {
              return {
                ...item,
                data: {
                  ...item.data,
                  series: [{
                    ...item.data.series[0],
                    data: [
                      ...item.data.series[0].data.slice(-19),
                      { timestamp: metrics.timestamp, value: metrics.responseTime }
                    ]
                  }]
                }
              };
            }
            if (item.id === 'errors-chart') {
              return {
                ...item,
                data: {
                  ...item.data,
                  series: [{
                    ...item.data.series[0],
                    data: [
                      ...item.data.series[0].data.slice(-19),
                      { timestamp: metrics.timestamp, value: metrics.errorRate }
                    ]
                  }]
                }
              };
            }
            return item;
          });

          // Create completely new message object
          newMessages[dashboardMsgIndex] = {
            ...msg,
            interactiveComponent: {
              ...msg.interactiveComponent!,
              data: {
                ...dashboardData,
                config: {
                  ...dashboardData.config,
                  items: updatedItems
                }
              }
            }
          };
        }

        console.log('[ThunderingHerd] Messages updated, returning new array');
        return newMessages;
      });
    });

    // Start streaming
    simulatorRef.current.start();

    return () => {
      unsubscribe();
      simulatorRef.current?.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Chat
        userId={OPS_TEAM.id}
        chatType="group"
        chatId="thundering-herd-incident"
        messages={messages}
        onSendMessage={() => {}}
        placeholder="Type a message..."
        showConnectionStatus={false}
        enableWebSocket={false}
        enableHTTP={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default ThunderingHerdIncidentExample;
