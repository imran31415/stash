export type EventType = 'task' | 'meeting' | 'deadline' | 'milestone' | 'custom';
export type EventStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  type?: EventType;
  status?: EventStatus;
  color?: string;
  allDay?: boolean;
  metadata?: {
    location?: string;
    attendees?: string[];
    priority?: 'low' | 'medium' | 'high';
    [key: string]: any;
  };
}

export interface CalendarTimelineData {
  id: string;
  title: string;
  description?: string;
  events: TimelineEvent[];
  metadata?: {
    totalEvents?: number;
    dateRange?: { start: Date; end: Date };
    [key: string]: any;
  };
}

export type CalendarTimelineMode = 'mini' | 'full';
export type CalendarView = 'month' | 'week' | 'day' | 'timeline';

export interface CalendarTimelineProps {
  data: CalendarTimelineData;
  mode?: CalendarTimelineMode;
  view?: CalendarView;
  height?: number;
  width?: number;
  initialDate?: Date;
  showWeekends?: boolean;
  onEventPress?: (event: TimelineEvent) => void;
  onDatePress?: (date: Date) => void;
  onExpandPress?: () => void;
}

export interface CalendarTimelineDetailViewProps {
  data: CalendarTimelineData;
  visible: boolean;
  onClose: () => void;
  onEventPress?: (event: TimelineEvent) => void;
  onDatePress?: (date: Date) => void;
}

export interface CalendarTimelineStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
}
