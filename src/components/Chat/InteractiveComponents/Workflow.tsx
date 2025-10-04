import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';
import Svg, { Rect, Path, Text as SvgText, Defs, Marker, G, Circle } from 'react-native-svg';
import type { WorkflowProps, WorkflowNode, WorkflowEdge, PositionedNode, PositionedEdge } from './Workflow.types';
import {
  calculateLayeredLayout,
  calculatePositionedEdges,
  getNodeColor,
  getNodeIcon,
  getNodeLabel,
  getEdgeColor,
  getEdgeStrokeDashArray,
  calculateWorkflowStats,
  findCriticalPath,
  formatDuration,
} from './Workflow.utils';
import {
  borderRadius,
  shadows,
  useResponsiveMode,
  useLayoutMeasurement,
  StatsBar,
} from './shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const Workflow: React.FC<WorkflowProps> = ({
  data,
  mode = 'mini',
  title,
  subtitle,
  onNodePress,
  onEdgePress,
  onExpandPress,
  showLabels = true,
  showEdgeLabels = false,
  showStatus = true,
  showMetadata = false,
  orientation = 'horizontal',
  enableLiveUpdates = false,
  animateExecution = false,
  highlightCriticalPath = false,
  layoutAlgorithm = 'layered',
  nodeSpacing = 80,
  layerSpacing = 100,
  height: customHeight,
  width: customWidth,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const { isMini } = useResponsiveMode(mode);
  const { width, height, handleLayout, measuredWidth } = useLayoutMeasurement(
    customWidth,
    customHeight || (isMini ? 300 : 500)
  );

  const containerWidth = customWidth || measuredWidth || (isMini ? 350 : SCREEN_WIDTH - 32);

  // Node dimensions
  const nodeWidth = isMini ? 100 : 160;
  const nodeHeight = isMini ? 50 : 80;
  const horizontalSpacing = isMini ? 60 : nodeSpacing;
  const verticalSpacing = isMini ? 80 : layerSpacing;

  // Calculate workflow stats
  const stats = useMemo(() => calculateWorkflowStats(data), [data]);

  // Calculate critical path if needed
  const criticalPath = useMemo(() => {
    if (highlightCriticalPath) {
      return new Set(findCriticalPath(data.nodes, data.edges));
    }
    return new Set<string>();
  }, [data.nodes, data.edges, highlightCriticalPath]);

  // Calculate layout
  const positionedNodes = useMemo<PositionedNode[]>(() => {
    return calculateLayeredLayout(data.nodes, data.edges, {
      width,
      height,
      nodeWidth,
      nodeHeight,
      horizontalSpacing,
      verticalSpacing,
      orientation,
      algorithm: layoutAlgorithm,
    });
  }, [data.nodes, data.edges, width, height, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing, orientation, layoutAlgorithm]);

  // Calculate positioned edges
  const positionedEdges = useMemo<PositionedEdge[]>(() => {
    return calculatePositionedEdges(data.edges, positionedNodes, nodeWidth, nodeHeight, orientation);
  }, [data.edges, positionedNodes, nodeWidth, nodeHeight, orientation]);

  // Calculate SVG viewBox with pan support
  const viewBox = useMemo(() => {
    if (positionedNodes.length === 0) return `0 0 ${width} ${height}`;

    const minX = Math.min(...positionedNodes.map((n) => n.x)) - 20;
    const minY = Math.min(...positionedNodes.map((n) => n.y)) - 20;
    const maxX = Math.max(...positionedNodes.map((n) => n.x + nodeWidth)) + 20;
    const maxY = Math.max(...positionedNodes.map((n) => n.y + nodeHeight)) + 20;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // In mini mode, always show the full content
    if (isMini) {
      return `${minX} ${minY} ${contentWidth} ${contentHeight}`;
    }

    // In full mode, allow pan
    return `${minX - panX} ${minY - panY} ${contentWidth} ${contentHeight}`;
  }, [positionedNodes, nodeWidth, nodeHeight, width, height, panX, panY, isMini]);

  const handleNodePress = useCallback(
    (node: WorkflowNode) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      onNodePress?.(node);
    },
    [onNodePress]
  );

  const handleEdgePress = useCallback(
    (edge: WorkflowEdge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
      onEdgePress?.(edge);
    },
    [onEdgePress]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handlePanLeft = useCallback(() => {
    setPanX((prev) => prev - 50);
  }, []);

  const handlePanRight = useCallback(() => {
    setPanX((prev) => prev + 50);
  }, []);

  const handlePanUp = useCallback(() => {
    setPanY((prev) => prev - 50);
  }, []);

  const handlePanDown = useCallback(() => {
    setPanY((prev) => prev + 50);
  }, []);

  const renderNode = (node: PositionedNode) => {
    const isSelected = selectedNodeId === node.id;
    const isOnCriticalPath = criticalPath.has(node.id);
    const color = getNodeColor(node, showStatus);
    const icon = getNodeIcon(node);
    const label = getNodeLabel(node, isMini ? 12 : 16);

    return (
      <G key={node.id} onPress={() => handleNodePress(node)}>
        {/* Node background */}
        <Rect
          x={node.x}
          y={node.y}
          width={nodeWidth}
          height={nodeHeight}
          fill={color}
          stroke={isSelected ? '#000000' : isOnCriticalPath ? '#FCD34D' : '#FFFFFF'}
          strokeWidth={isSelected ? 3 : isOnCriticalPath ? 2.5 : 1.5}
          rx={8}
          ry={8}
          opacity={0.9}
        />

        {/* Node icon */}
        <SvgText
          x={node.x + nodeWidth / 2}
          y={node.y + nodeHeight / 2 - (showLabels ? 8 : 0)}
          fontSize={isMini ? 16 : 20}
          fill="#FFFFFF"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {icon}
        </SvgText>

        {/* Node label */}
        {showLabels && (
          <SvgText
            x={node.x + nodeWidth / 2}
            y={node.y + nodeHeight / 2 + 12}
            fontSize={isMini ? 9 : 11}
            fontWeight="600"
            fill="#FFFFFF"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        )}

        {/* Status indicator */}
        {showStatus && node.status && (
          <Circle
            cx={node.x + nodeWidth - 8}
            cy={node.y + 8}
            r={5}
            fill={
              node.status === 'running'
                ? '#60A5FA'
                : node.status === 'success'
                ? '#34D399'
                : node.status === 'failed'
                ? '#F87171'
                : '#9CA3AF'
            }
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
        )}
      </G>
    );
  };

  const renderEdge = (edge: PositionedEdge) => {
    const isSelected = selectedEdgeId === edge.id;
    const isOnCriticalPath =
      highlightCriticalPath &&
      criticalPath.has(edge.source) &&
      criticalPath.has(edge.target);
    const color = getEdgeColor(edge);
    const strokeDashArray = getEdgeStrokeDashArray(edge);

    return (
      <G key={edge.id}>
        {/* Edge path */}
        <Path
          d={edge.path}
          stroke={isOnCriticalPath ? '#FCD34D' : color}
          strokeWidth={isSelected ? 3 : isOnCriticalPath ? 2.5 : edge.width || 2}
          fill="none"
          markerEnd="url(#arrowhead)"
          strokeDasharray={strokeDashArray}
          opacity={0.8}
        />

        {/* Edge label */}
        {showEdgeLabels && edge.label && (
          <SvgText
            x={(edge.sourceX + edge.targetX) / 2}
            y={(edge.sourceY + edge.targetY) / 2 - 5}
            fontSize={isMini ? 8 : 10}
            fill="#6B7280"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {edge.label}
          </SvgText>
        )}
      </G>
    );
  };

  const renderSelectedNodeDetails = () => {
    if (!selectedNodeId || !showMetadata) return null;

    const node = data.nodes.find((n) => n.id === selectedNodeId);
    if (!node || !node.metadata) return null;

    return (
      <View style={styles.detailsPanel}>
        <Text style={styles.detailsTitle}>{node.label}</Text>
        {node.description && (
          <Text style={styles.detailsDescription}>{node.description}</Text>
        )}
        {node.status && (
          <Text style={styles.detailsText}>Status: {node.status}</Text>
        )}
        {node.metadata.duration && (
          <Text style={styles.detailsText}>
            Duration: {formatDuration(node.metadata.duration)}
          </Text>
        )}
        {node.metadata.retries !== undefined && (
          <Text style={styles.detailsText}>Retries: {node.metadata.retries}</Text>
        )}
        {node.metadata.error && (
          <Text style={[styles.detailsText, styles.errorText]}>
            Error: {node.metadata.error}
          </Text>
        )}
      </View>
    );
  };

  if (positionedNodes.length === 0) {
    return (
      <View style={[styles.container, { height }]} onLayout={handleLayout}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No workflow data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height, width: '100%', maxWidth: '100%' }]} onLayout={handleLayout}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Workflow Stats */}
      {mode === 'full' && (
        <StatsBar
          stats={[
            { value: stats.totalNodes, label: 'Nodes' },
            { value: stats.totalEdges, label: 'Edges' },
            { value: stats.layers, label: 'Layers' },
            ...(data.metadata?.successRate !== undefined
              ? [{ value: `${(data.metadata.successRate * 100).toFixed(0)}%`, label: 'Success Rate' }]
              : []),
          ]}
        />
      )}

      {/* Workflow Visualization */}
      <ScrollView
        horizontal={!isMini}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={!isMini}
        showsVerticalScrollIndicator={false}
        minimumZoomScale={0.5}
        maximumZoomScale={3}
        pinchGestureEnabled={!isMini}
        scrollEnabled={!isMini}
      >
        <Svg
          width={isMini ? width : width * zoom}
          height={isMini ? (height - (title || subtitle ? 60 : 0)) : (height - (title || subtitle ? 60 : 0) - (mode === 'full' ? 60 : 0)) * zoom}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            {/* Arrow marker for directed edges */}
            <Marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
            </Marker>
          </Defs>

          {/* Render edges first (below nodes) */}
          {positionedEdges.map((edge) => renderEdge(edge))}

          {/* Render nodes */}
          {positionedNodes.map((node) => renderNode(node))}
        </Svg>
      </ScrollView>

      {/* Zoom Controls */}
      {mode === 'full' && (
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleResetZoom}>
            <Text style={styles.zoomResetText}>{Math.round(zoom * 100)}%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pan Controls */}
      {mode === 'full' && (
        <View style={styles.panControls}>
          <TouchableOpacity style={styles.panButton} onPress={handlePanUp}>
            <Text style={styles.panButtonText}>↑</Text>
          </TouchableOpacity>
          <View style={styles.panHorizontal}>
            <TouchableOpacity style={styles.panButton} onPress={handlePanLeft}>
              <Text style={styles.panButtonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panButton} onPress={handlePanRight}>
              <Text style={styles.panButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.panButton} onPress={handlePanDown}>
            <Text style={styles.panButtonText}>↓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected node details */}
      {renderSelectedNodeDetails()}

      {/* Expand button */}
      {mode === 'mini' && onExpandPress && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
          <Text style={styles.expandButtonText}>⛶ Expand</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.md,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  detailsPanel: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailsDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  errorText: {
    color: '#EF4444',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  zoomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  zoomResetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  panControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  panHorizontal: {
    flexDirection: 'row',
    gap: 4,
  },
  panButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    margin: 1,
  },
  panButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
