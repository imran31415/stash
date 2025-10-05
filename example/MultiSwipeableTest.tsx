import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiSwipeable } from '../src/components/Chat/InteractiveComponents';

// Minimal test data
const testItems = [
  {
    id: 'test-1',
    type: 'task-list' as const,
    title: 'Test Tasks',
    subtitle: 'Testing subtitle',
    data: {
      tasks: [
        {
          id: 't1',
          title: 'Test Task 1',
          status: 'in_progress' as const,
          startDate: new Date(),
          endDate: new Date(),
        },
      ],
      title: 'Tasks',
      mode: 'preview' as const,
    },
  },
];

export default function MultiSwipeableTest() {
  console.log('[MultiSwipeableTest] Rendering with items:', testItems);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MultiSwipeable Test</Text>
      <View style={styles.componentContainer}>
        <MultiSwipeable
          items={testItems}
          mode="preview"
          showDots={true}
          showArrows={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  componentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
});
