import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import type { FlameGraphProps, FlameGraphNode } from './FlameGraph.types';

/**
 * FlameGraph Component
 *
 * Visualizes profiling data as a flame graph, showing call stacks and time distribution.
 * Perfect for CPU profiling, memory analysis, and performance optimization.
 */
export const FlameGraph: React.FC<FlameGraphProps> = ({
  data,
  title,
  subtitle,
  mode = 'preview',
  colorScheme = 'hot',
  showTooltips = true,
  showSearch = true,
  minPercentage = 0.1,
  onNodeClick,
  onSearch,
  height: customHeight,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<FlameGraphNode | null>(null);
  const [focusedNode, setFocusedNode] = useState<FlameGraphNode>(data.root);

  const screenWidth = Dimensions.get('window').width;

  // Calculate heights based on mode
  const containerHeight = customHeight || (mode === 'mini' ? 200 : mode === 'preview' ? 350 : 500);
  const graphHeight = mode === 'mini' ? 150 : mode === 'preview' ? 280 : 400;

  // Color schemes
  const colorSchemes = {
    hot: ['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#B45309', '#92400E'],
    cold: ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
    green: ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857'],
    blue: ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1E40AF'],
    rainbow: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
  };

  const colors = colorSchemes[colorScheme];

  // Get color based on depth
  const getColor = (depth: number) => {
    return colors[depth % colors.length];
  };

  // Calculate percentage
  const getPercentage = (value: number) => {
    return (value / data.total) * 100;
  };

  // Format value with unit
  const formatValue = (value: number) => {
    if (data.unit === 'ms') {
      return `${value.toFixed(2)}ms`;
    } else if (data.unit === 'bytes') {
      if (value > 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(2)}MB`;
      } else if (value > 1024) {
        return `${(value / 1024).toFixed(2)}KB`;
      }
      return `${value}B`;
    }
    return value.toLocaleString();
  };

  // Flatten flame graph for rendering
  interface FlatNode {
    node: FlameGraphNode;
    depth: number;
    x: number;
    width: number;
    parent: FlameGraphNode | null;
  }

  const flattenGraph = useCallback((
    node: FlameGraphNode,
    depth: number = 0,
    x: number = 0,
    width: number = 100,
    parent: FlameGraphNode | null = null,
  ): FlatNode[] => {
    const percentage = getPercentage(node.value);

    if (percentage < minPercentage) {
      return [];
    }

    const result: FlatNode[] = [{ node, depth, x, width, parent }];

    if (node.children && node.children.length > 0) {
      let childX = x;
      const totalChildValue = node.children.reduce((sum, child) => sum + child.value, 0);

      node.children.forEach((child) => {
        const childWidth = (child.value / totalChildValue) * width;
        result.push(...flattenGraph(child, depth + 1, childX, childWidth, node));
        childX += childWidth;
      });
    }

    return result;
  }, [data.total, minPercentage]);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    const allNodes = flattenGraph(focusedNode);

    if (!searchQuery) {
      return allNodes;
    }

    const query = searchQuery.toLowerCase();
    return allNodes.filter(({ node }) =>
      node.name.toLowerCase().includes(query) ||
      node.metadata?.file?.toLowerCase().includes(query)
    );
  }, [focusedNode, searchQuery, flattenGraph]);

  // Get maximum depth for height calculation
  const maxDepth = useMemo(() => {
    return Math.max(...filteredNodes.map(n => n.depth));
  }, [filteredNodes]);

  const nodeHeight = 24;

  // Handle node click
  const handleNodeClick = (flatNode: FlatNode) => {
    setSelectedNode(flatNode.node);
    if (onNodeClick) {
      onNodeClick(flatNode.node);
    }
  };

  // Handle zoom to node
  const handleZoomToNode = (node: FlameGraphNode) => {
    setFocusedNode(node);
    setSelectedNode(null);
  };

  // Reset zoom
  const handleResetZoom = () => {
    setFocusedNode(data.root);
    setSelectedNode(null);
  };

  // Render flame graph node
  const renderNode = (flatNode: FlatNode) => {
    const { node, depth, x, width } = flatNode;
    const percentage = getPercentage(node.value);
    const isSelected = selectedNode?.id === node.id;
    const isSearchMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

    const nodeWidth = (width / 100) * (screenWidth - 40);
    const nodeLeft = (x / 100) * (screenWidth - 40);

    // Only render if width is sufficient
    if (nodeWidth < 2) return null;

    return (
      <TouchableOpacity
        key={`${node.id}-${depth}-${x}`}
        style={[
          styles.flameNode,
          {
            top: depth * nodeHeight,
            left: nodeLeft,
            width: nodeWidth,
            backgroundColor: isSearchMatch ? '#EF4444' : getColor(depth),
            borderColor: isSelected ? '#1F2937' : 'transparent',
            borderWidth: isSelected ? 2 : 0,
          },
        ]}
        onPress={() => handleNodeClick(flatNode)}
        activeOpacity={0.7}
      >
        {nodeWidth > 50 && (
          <Text
            style={styles.flameNodeText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {node.name}
          </Text>
        )}
        {nodeWidth > 80 && (
          <Text style={styles.flameNodePercentage}>
            {percentage.toFixed(1)}%
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render detail panel
  const renderDetailPanel = () => {
    if (!selectedNode) return null;

    const percentage = getPercentage(selectedNode.value);

    return (
      <View style={styles.detailPanel}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderContent}>
            <Text style={styles.detailTitle} numberOfLines={1}>
              {selectedNode.name}
            </Text>
            <Text style={styles.detailSubtitle}>
              {formatValue(selectedNode.value)} ({percentage.toFixed(2)}%)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedNode(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          {selectedNode.metadata?.file && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File:</Text>
              <Text style={styles.detailValue}>{selectedNode.metadata.file}</Text>
            </View>
          )}
          {selectedNode.metadata?.line && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Line:</Text>
              <Text style={styles.detailValue}>{selectedNode.metadata.line}</Text>
            </View>
          )}
          {selectedNode.metadata?.samples !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Samples:</Text>
              <Text style={styles.detailValue}>{selectedNode.metadata.samples.toLocaleString()}</Text>
            </View>
          )}
          {selectedNode.metadata?.selfTime !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Self Time:</Text>
              <Text style={styles.detailValue}>{formatValue(selectedNode.metadata.selfTime)}</Text>
            </View>
          )}
          {selectedNode.metadata?.totalTime !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Time:</Text>
              <Text style={styles.detailValue}>{formatValue(selectedNode.metadata.totalTime)}</Text>
            </View>
          )}

          {selectedNode !== focusedNode && (
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoomToNode(selectedNode)}
            >
              <Text style={styles.zoomButtonText}>🔍 Zoom to this node</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }, style]}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Search and controls */}
      {mode !== 'mini' && showSearch && (
        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search functions..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (onSearch) onSearch(text);
            }}
            placeholderTextColor="#9CA3AF"
          />
          {focusedNode !== data.root && (
            <TouchableOpacity style={styles.resetButton} onPress={handleResetZoom}>
              <Text style={styles.resetButtonText}>↺ Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Metadata */}
      {mode === 'detail' && data.metadata && (
        <View style={styles.metadata}>
          {data.metadata.type && (
            <Text style={styles.metadataText}>Type: {data.metadata.type}</Text>
          )}
          {data.metadata.duration && (
            <Text style={styles.metadataText}>
              Duration: {formatValue(data.metadata.duration)}
            </Text>
          )}
          {data.metadata.application && (
            <Text style={styles.metadataText}>App: {data.metadata.application}</Text>
          )}
        </View>
      )}

      {/* Flame graph */}
      <ScrollView
        style={[styles.graphContainer, { height: graphHeight }]}
        horizontal
        showsHorizontalScrollIndicator={mode === 'detail'}
      >
        <View style={{ height: (maxDepth + 1) * nodeHeight, width: screenWidth - 40 }}>
          {filteredNodes.map(renderNode)}
        </View>
      </ScrollView>

      {/* Detail panel */}
      {mode === 'detail' && renderDetailPanel()}

      {/* Mini mode summary */}
      {mode === 'mini' && (
        <View style={styles.miniSummary}>
          <Text style={styles.miniText}>
            {data.root.name} • {formatValue(data.total)} total
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    fontSize: 14,
    color: '#111827',
  },
  resetButton: {
    height: 36,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  flameNode: {
    position: 'absolute',
    height: 22,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameNodeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  flameNodePercentage: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  detailPanel: {
    height: 200,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailHeaderContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  detailSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailContent: {
    flex: 1,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    width: 100,
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },
  zoomButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  zoomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  miniSummary: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  miniText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
