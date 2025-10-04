import type { CalendarTimelineData, CalendarTimelineStats, TimelineEvent } from './CalendarTimeline.types';

/**
 * Calculate calendar statistics
 */
export function calculateCalendarStats(data: CalendarTimelineData): CalendarTimelineStats {
  const now = new Date();
  let completedEvents = 0;
  let pendingEvents = 0;
  let upcomingEvents = 0;
  let overdueEvents = 0;

  data.events.forEach((event) => {
    if (event.status === 'completed') {
      completedEvents++;
    } else if (event.status === 'pending') {
      pendingEvents++;
      if (event.end && event.end < now) {
        overdueEvents++;
      } else if (event.start > now) {
        upcomingEvents++;
      }
    }
  });

  return {
    totalEvents: data.events.length,
    completedEvents,
    pendingEvents,
    upcomingEvents,
    overdueEvents,
  };
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: TimelineEvent[], date: Date): TimelineEvent[] {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return events.filter((event) => {
    const eventStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const eventEnd = event.end
      ? new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())
      : eventStart;

    return targetDate >= eventStart && targetDate <= eventEnd;
  });
}

/**
 * Get events for a date range
 */
export function getEventsForRange(events: TimelineEvent[], start: Date, end: Date): TimelineEvent[] {
  return events.filter((event) => {
    const eventStart = event.start;
    const eventEnd = event.end || event.start;

    return (eventStart >= start && eventStart <= end) ||
           (eventEnd >= start && eventEnd <= end) ||
           (eventStart <= start && eventEnd >= end);
  });
}

/**
 * Get default color for event type
 */
export function getEventColor(event: TimelineEvent): string {
  if (event.color) return event.color;

  switch (event.type) {
    case 'task':
      return '#3B82F6';
    case 'meeting':
      return '#10B981';
    case 'deadline':
      return '#EF4444';
    case 'milestone':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
}

/**
 * Format date range
 */
export function formatDateRange(start: Date, end?: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end || start.toDateString() === end.toDateString()) {
    return startStr;
  }
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}`;
}

/**
 * Format time
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Get week dates
 */
export function getWeekDates(date: Date): Date[] {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  const week: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    week.push(new Date(day));
  }

  return week;
}

/**
 * Get month dates
 */
export function getMonthDates(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: Date[] = [];

  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    dates.push(new Date(year, month, -i));
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  // Add days from next month to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    dates.push(new Date(year, month + 1, i));
  }

  return dates;
}
