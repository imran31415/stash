import type { Message } from '../../src/components/Chat';
import { addDays, addHours, subDays } from 'date-fns';

/**
 * Chat conversation showcasing new components:
 * - FormBuilder
 * - ComparisonTable
 * - SankeyDiagram
 * - NetworkTopology
 * - FunnelChart
 * - CalendarTimeline
 */
export const getNewComponentsMessages = (): Message[] => {
  return [
    // FormBuilder Introduction
    {
      id: 'new-comp-1a',
      type: 'text',
      content: "Can I embed interactive forms directly in chat? I want to collect structured data from users.",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.01),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-1b',
      type: 'text',
      content: "## Dynamic Form Builder\n\nYes! The **FormBuilder** component lets you create rich, interactive forms right in the chat. Perfect for:\n• User registration and onboarding\n• Survey and feedback collection\n• Configuration wizards\n• Data entry workflows\n\nFeatures:\n• Multiple field types (text, email, select, checkbox, date, etc.)\n• Real-time validation\n• Conditional logic\n• Section organization\n• Mobile-optimized\n\nHere's a user registration form:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.011),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'form-builder',
          id: 'user-registration-form',
          title: 'User Registration Form',
          description: 'Collect user information for account creation',
          sections: [
            {
              id: 'personal-info',
              title: 'Personal Information',
              description: 'Basic details',
              fields: [
                { id: 'firstName', type: 'text', label: 'First Name', placeholder: 'John', required: true },
                { id: 'lastName', type: 'text', label: 'Last Name', placeholder: 'Doe', required: true },
                { id: 'email', type: 'email', label: 'Email', placeholder: 'john@example.com', required: true },
                { id: 'birthdate', type: 'date', label: 'Date of Birth', required: true },
              ],
            },
            {
              id: 'account-settings',
              title: 'Account Settings',
              fields: [
                { id: 'username', type: 'text', label: 'Username', placeholder: 'johndoe123', required: true },
                {
                  id: 'accountType',
                  type: 'select',
                  label: 'Account Type',
                  required: true,
                  options: [
                    { label: 'Personal', value: 'personal' },
                    { label: 'Business', value: 'business' },
                  ],
                },
                { id: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
              ],
            },
          ],
          mode: 'preview',
        },
      },
    },

    // ComparisonTable
    {
      id: 'new-comp-2a',
      type: 'text',
      content: "What about comparing products or services side-by-side?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.02),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-2b',
      type: 'text',
      content: "## Comparison Tables\n\nThe **ComparisonTable** is perfect for side-by-side comparisons! Great for:\n• Product feature comparisons\n• Pricing plan matrices\n• Vendor evaluation\n• A/B test results\n\nFeatures:\n• Visual highlighting for better/worse values\n• Boolean indicators (✓/✗)\n• Numeric comparisons with colors\n• Mobile-responsive\n\nHere's a cloud provider comparison:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.021),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'comparison-table',
          id: 'cloud-comparison',
          title: 'Cloud Provider Comparison',
          description: 'Compare features across providers',
          columns: [
            { id: 'feature', label: 'Feature', width: 200 },
            { id: 'aws', label: 'AWS', width: 150 },
            { id: 'azure', label: 'Azure', width: 150 },
            { id: 'gcp', label: 'Google Cloud', width: 150 },
          ],
          rows: [
            { id: 'row1', cells: [
              { id: 'c1', type: 'text', value: 'Compute' },
              { id: 'c2', type: 'text', value: 'EC2' },
              { id: 'c3', type: 'text', value: 'Virtual Machines' },
              { id: 'c4', type: 'text', value: 'Compute Engine' },
            ]},
            { id: 'row2', cells: [
              { id: 'c1', type: 'text', value: 'Starting Price' },
              { id: 'c2', type: 'number', value: 10, result: 'lower' },
              { id: 'c3', type: 'number', value: 12, result: 'higher' },
              { id: 'c4', type: 'number', value: 11, result: 'neutral' },
            ]},
            { id: 'row3', cells: [
              { id: 'c1', type: 'text', value: 'Free Tier' },
              { id: 'c2', type: 'boolean', value: true },
              { id: 'c3', type: 'boolean', value: true },
              { id: 'c4', type: 'boolean', value: true },
            ]},
          ],
          mode: 'preview',
        },
      },
    },

    // SankeyDiagram
    {
      id: 'new-comp-3a',
      type: 'text',
      content: "How can I show flow and distribution through a system?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.03),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-3b',
      type: 'text',
      content: "## Sankey Diagrams: Visualize Flow\n\n**SankeyDiagrams** are perfect for showing flow and distribution! Ideal for:\n• Energy flow and distribution\n• Budget allocation\n• User journey paths\n• Resource utilization\n• Supply chain flows\n\nThe width of each flow represents magnitude, making it easy to spot major pathways at a glance.\n\nHere's an energy distribution example:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.031),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'sankey-diagram',
          id: 'energy-flow',
          title: 'Energy Distribution',
          description: 'Power grid flow visualization',
          nodes: [
            { id: 'coal', label: 'Coal', color: '#8B4513' },
            { id: 'solar', label: 'Solar', color: '#FFD700' },
            { id: 'wind', label: 'Wind', color: '#87CEEB' },
            { id: 'generation', label: 'Generation', color: '#4169E1' },
            { id: 'residential', label: 'Residential', color: '#32CD32' },
            { id: 'commercial', label: 'Commercial', color: '#FF6347' },
          ],
          links: [
            { source: 'coal', target: 'generation', value: 35 },
            { source: 'solar', target: 'generation', value: 25 },
            { source: 'wind', target: 'generation', value: 40 },
            { source: 'generation', target: 'residential', value: 45 },
            { source: 'generation', target: 'commercial', value: 55 },
          ],
          mode: 'preview',
        },
      },
    },

    // NetworkTopology
    {
      id: 'new-comp-4a',
      type: 'text',
      content: "What about network infrastructure visualization?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.04),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-4b',
      type: 'text',
      content: "## Network Topology Visualization\n\n**NetworkTopology** shows your infrastructure layout! Perfect for:\n• Data center architecture\n• Network diagrams\n• System infrastructure\n• Service dependencies\n• IoT device networks\n\nFeatures:\n• Visual node types (router, switch, server, firewall)\n• Connection status indicators\n• Bandwidth labels\n• Interactive exploration\n\nHere's a data center topology:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.041),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'network-topology',
          id: 'datacenter-network',
          title: 'Data Center Network',
          description: 'Infrastructure layout',
          nodes: [
            { id: 'router1', label: 'Core Router', type: 'router', status: 'active', x: 400, y: 100 },
            { id: 'switch1', label: 'Switch 1', type: 'switch', status: 'active', x: 200, y: 250 },
            { id: 'switch2', label: 'Switch 2', type: 'switch', status: 'active', x: 600, y: 250 },
            { id: 'server1', label: 'Web Server', type: 'server', status: 'active', x: 100, y: 400 },
            { id: 'server2', label: 'DB Server', type: 'server', status: 'warning', x: 300, y: 400 },
            { id: 'server3', label: 'App Server', type: 'server', status: 'active', x: 500, y: 400 },
          ],
          connections: [
            { id: 'c1', source: 'router1', target: 'switch1', type: 'ethernet', status: 'active', bandwidth: '10Gbps' },
            { id: 'c2', source: 'router1', target: 'switch2', type: 'ethernet', status: 'active', bandwidth: '10Gbps' },
            { id: 'c3', source: 'switch1', target: 'server1', type: 'ethernet', status: 'active', bandwidth: '1Gbps' },
            { id: 'c4', source: 'switch1', target: 'server2', type: 'ethernet', status: 'warning', bandwidth: '1Gbps' },
            { id: 'c5', source: 'switch2', target: 'server3', type: 'ethernet', status: 'active', bandwidth: '1Gbps' },
          ],
          mode: 'preview',
        },
      },
    },

    // FunnelChart
    {
      id: 'new-comp-5a',
      type: 'text',
      content: "How do I track conversion rates and drop-offs?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.05),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-5b',
      type: 'text',
      content: "## Funnel Charts: Track Conversions\n\n**FunnelCharts** visualize conversion funnels! Perfect for:\n• Sales pipelines\n• User onboarding flows\n• Marketing campaigns\n• Checkout processes\n• Feature adoption\n\nFeatures:\n• Automatic drop-off calculation\n• Percentage at each stage\n• Visual width shows volume\n• Color-coded stages\n\nHere's a sales funnel:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.051),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'funnel-chart',
          id: 'sales-funnel',
          title: 'Sales Conversion Funnel',
          description: 'User journey to purchase',
          stages: [
            { id: 'awareness', label: 'Website Visitors', value: 10000, color: '#3B82F6' },
            { id: 'interest', label: 'Product Views', value: 5000, color: '#8B5CF6' },
            { id: 'consideration', label: 'Add to Cart', value: 2000, color: '#EC4899' },
            { id: 'intent', label: 'Checkout', value: 800, color: '#F59E0B' },
            { id: 'purchase', label: 'Purchase', value: 500, color: '#10B981' },
          ],
          mode: 'preview',
          showDropoff: true,
        },
      },
    },

    // CalendarTimeline
    {
      id: 'new-comp-6a',
      type: 'text',
      content: "What about project timelines and event calendars?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.06),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'new-comp-6b',
      type: 'text',
      content: "## Calendar Timeline\n\n**CalendarTimeline** shows events and schedules! Great for:\n• Sprint planning\n• Project milestones\n• Event scheduling\n• Deadline tracking\n• Team calendars\n\nFeatures:\n• Multiple view modes (month, week, day, timeline)\n• Event types and status\n• Color-coded events\n• Interactive date selection\n\nHere's a sprint calendar:",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.061),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'custom',
        data: {
          componentType: 'calendar-timeline',
          id: 'sprint-calendar',
          title: 'Sprint 15 Timeline',
          description: 'Team schedule',
          events: [
            {
              id: 'e1',
              title: 'Sprint Planning',
              start: new Date(),
              end: addHours(new Date(), 2),
              type: 'meeting',
              status: 'completed',
              color: '#3B82F6',
            },
            {
              id: 'e2',
              title: 'Feature Development',
              start: addDays(new Date(), 1),
              end: addDays(new Date(), 5),
              type: 'task',
              status: 'in-progress',
              color: '#8B5CF6',
            },
            {
              id: 'e3',
              title: 'Code Review',
              start: addDays(new Date(), 5),
              end: addDays(new Date(), 6),
              type: 'task',
              status: 'pending',
              color: '#F59E0B',
            },
            {
              id: 'e4',
              title: 'Sprint Demo',
              start: addDays(new Date(), 7),
              type: 'meeting',
              status: 'pending',
              color: '#10B981',
            },
            {
              id: 'e5',
              title: 'Release',
              start: addDays(new Date(), 10),
              type: 'deadline',
              status: 'pending',
              color: '#EF4444',
            },
          ],
          mode: 'preview',
          view: 'timeline',
        },
      },
    },
  ];
};
