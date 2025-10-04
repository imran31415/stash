import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../../theme';
import type { CalendarTimelineProps, TimelineEvent } from './CalendarTimeline.types';
import {
  calculateCalendarStats,
  getEventsForDate,
  getEventColor,
  formatDateRange,
  formatTime,
  getMonthDates,
} from './CalendarTimeline.utils';

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  data,
  mode = 'mini',
  view = 'month',
  height = 400,
  width,
  initialDate,
  showWeekends = true,
  onEventPress,
  onDatePress,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  const stats = useMemo(() => calculateCalendarStats(data), [data]);
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  const renderEvent = (event: TimelineEvent) => {
    const eventColor = getEventColor(event);

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, { backgroundColor: colors.surface, borderLeftColor: eventColor, borderLeftWidth: 4 }]}
        onPress={() => onEventPress?.(event)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          {event.status && (
            <View style={[styles.statusBadge, { backgroundColor: eventColor }]}>
              <Text style={styles.statusText}>{event.status}</Text>
            </View>
          )}
        </View>
        {event.description && !isMini && (
          <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
          {formatDateRange(event.start, event.end)}
          {!event.allDay && ` • ${formatTime(event.start)}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.description && !isMini && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {data.description}
            </Text>
          )}
        </View>
        {isMini && onExpandPress && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
            <Text style={styles.expandIcon}>⤢</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalEvents}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.completedEvents}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.upcomingEvents}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Upcoming</Text>
        </View>
        {!isMini && stats.overdueEvents > 0 && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.overdueEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Overdue</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.eventsContainer} contentContainerStyle={styles.eventsContent} showsVerticalScrollIndicator={true}>
        {data.events.map(renderEvent)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerContent: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  description: { fontSize: 13 },
  expandButton: { padding: 8, marginLeft: 8 },
  expandIcon: { fontSize: 20 },
  statsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  eventsContainer: { flex: 1 },
  eventsContent: { padding: 16, gap: 12 },
  eventCard: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  eventDescription: { fontSize: 13, marginBottom: 8 },
  eventTime: { fontSize: 12 },
});
