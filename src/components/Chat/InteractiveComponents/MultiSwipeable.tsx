import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import type { MultiSwipeableProps, SwipeableItem } from './MultiSwipeable.types';
import { GanttChart } from './GanttChart';
import { TaskList } from './TaskList';
import { TimeSeriesChart } from './TimeSeriesChart';
import { GraphVisualization } from './GraphVisualization';
import { CodeBlock } from './CodeBlock';
import { Media } from './Media';
import { DataTable } from './DataTable';
import { FlameGraph } from './FlameGraph';
import { Workflow } from './Workflow';
import { Dashboard } from './Dashboard';

/**
 * MultiSwipeable Component
 *
 * A swipeable gallery component that displays multiple interactive components
 * Users can swipe through different visualizations like a carousel
 */
export const MultiSwipeable: React.FC<MultiSwipeableProps> = ({
  items,
  mode = 'preview',
  initialIndex = 0,
  showDots = true,
  showArrows = true,
  autoAdvanceInterval = 0,
  onItemChange,
  onExpandPress,
  onItemAction,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const isPreview = mode === 'preview';

  // Calculate dimensions
  const itemWidth = containerWidth > 0 ? containerWidth : (isMini ? 350 : isPreview ? 600 : screenWidth);
  const itemHeight = isMini ? 300 : isPreview ? 400 : 500;
  // Total container height includes header, content, dots, and footer
  const containerHeight = itemHeight + 120; // header + dots + footer padding

  // Handle auto-advance
  useEffect(() => {
    if (autoAdvanceInterval > 0 && items.length > 1) {
      autoAdvanceTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % items.length;
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }, autoAdvanceInterval);

      return () => {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
        }
      };
    }
  }, [autoAdvanceInterval, items.length]);

  // Scroll to index when currentIndex changes (but not during manual scrolling)
  useEffect(() => {
    if (!isScrolling.current && itemWidth > 0) {
      scrollToIndex(currentIndex);
    }
  }, [currentIndex, itemWidth]);

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current && itemWidth > 0) {
      scrollViewRef.current.scrollTo({
        x: index * itemWidth,
        animated: true,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      onItemChange?.(nextIndex, items[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      onItemChange?.(prevIndex, items[prevIndex]);
    }
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    onItemChange?.(index, items[index]);
  };

  const isScrolling = useRef(false);

  const handleScrollBegin = () => {
    isScrolling.current = true;
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemWidth);

    if (index !== currentIndex && index >= 0 && index < items.length && itemWidth > 0) {
      setCurrentIndex(index);
      onItemChange?.(index, items[index]);
    }

    isScrolling.current = false;
  };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const renderItem = (item: SwipeableItem, index: number) => {
    const isActive = index === currentIndex;

    // Create handlers that pass the item index
    const createActionHandler = (action: string) => (data: any) => {
      onItemAction?.(action, data, index);
    };

    const handleExpand = () => {
      onExpandPress?.(item, index);
    };

    const componentProps = {
      ...item.data,
      mode: item.data.mode || mode,
      title: item.title || item.data.title,
      subtitle: item.subtitle || item.data.subtitle,
      height: itemHeight - 16, // Subtract padding
      width: itemWidth - 16, // Subtract padding
    };

    switch (item.type) {
      case 'gantt-chart':
        return (
          <GanttChart
            {...componentProps}
            onTaskPress={createActionHandler('task-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'task-list':
        return (
          <TaskList
            {...componentProps}
            onTaskPress={createActionHandler('task-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'time-series-chart':
        return (
          <TimeSeriesChart
            {...componentProps}
            onDataPointPress={createActionHandler('data-point-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'graph-visualization':
        return (
          <GraphVisualization
            data={item.data.data || item.data}
            mode={item.data.mode || mode}
            title={item.title || item.data.title}
            subtitle={item.subtitle || item.data.subtitle}
            showLabels={item.data.showLabels}
            enablePhysics={item.data.enablePhysics}
            onNodePress={createActionHandler('node-press')}
            onEdgePress={createActionHandler('edge-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'code-block':
        return (
          <CodeBlock
            {...componentProps}
            onCopy={createActionHandler('copy')}
            onViewFullFile={handleExpand}
          />
        );

      case 'media':
        return (
          <Media
            {...componentProps}
            onExpand={handleExpand}
            onAction={createActionHandler}
          />
        );

      case 'data-table':
        return (
          <DataTable
            {...componentProps}
            onRowPress={createActionHandler('row-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'flamegraph':
        return (
          <FlameGraph
            data={item.data.data || item.data}
            mode={item.data.mode || mode}
            title={item.title || item.data.title}
            subtitle={item.subtitle || item.data.subtitle}
            onNodeClick={createActionHandler('node-click')}
            onExpandPress={handleExpand}
          />
        );

      case 'workflow':
        return (
          <Workflow
            data={item.data.data || item.data}
            mode={item.data.mode || mode}
            title={item.title || item.data.title}
            subtitle={item.subtitle || item.data.subtitle}
            showLabels={item.data.showLabels}
            showStatus={item.data.showStatus}
            orientation={item.data.orientation}
            onNodePress={createActionHandler('node-press')}
            onExpandPress={handleExpand}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            {...componentProps}
            onItemPress={createActionHandler('item-press')}
            onExpandPress={handleExpand}
          />
        );

      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown component type: {item.type}</Text>
          </View>
        );
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>No items to display</Text>
      </View>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <View
      style={[styles.container, { minHeight: containerHeight }, style]}
      onLayout={handleLayout}
    >
      {/* Header with item counter */}
      <View style={styles.header}>
        <Text style={styles.counter}>
          {currentIndex + 1} / {items.length}
        </Text>
        {currentItem.title && (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentItem.title}
          </Text>
        )}
      </View>

      {/* Swipeable content area */}
      <View style={[styles.contentContainer, { height: itemHeight }]}>
        {/* Previous arrow */}
        {showArrows && currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.arrow, styles.arrowLeft]}
            onPress={handlePrevious}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous item"
            accessibilityHint={`View ${items[currentIndex - 1]?.title || 'previous item'}`}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
        )}

        {/* Scrollable items */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          style={[styles.scrollView, { height: itemHeight }]}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
        >
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemContainer, { width: itemWidth, height: itemHeight }]}
            >
              {renderItem(item, index)}
            </View>
          ))}
        </ScrollView>

        {/* Next arrow */}
        {showArrows && currentIndex < items.length - 1 && (
          <TouchableOpacity
            style={[styles.arrow, styles.arrowRight]}
            onPress={handleNext}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Next item"
            accessibilityHint={`View ${items[currentIndex + 1]?.title || 'next item'}`}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation dots */}
      {showDots && items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}

      {/* Subtitle for current item */}
      {currentItem.subtitle && (
        <View style={styles.footer}>
          <Text style={styles.subtitle} numberOfLines={2}>
            {currentItem.subtitle}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  contentContainer: {
    position: 'relative',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
  },
  itemContainer: {
    padding: 8,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
});
