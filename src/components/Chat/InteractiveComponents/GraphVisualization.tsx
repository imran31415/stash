import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Defs, Marker, Path, G } from 'react-native-svg';
import type { GraphVisualizationProps, GraphNode, GraphEdge } from './GraphVisualization.types';
import {
  applyForceLayout,
  applyForceLayoutAsync,
  applyFocusedLayout,
  applyFocusedLayoutAsync,
  getNodeColor,
  getNodeSize,
  getNodeLabel,
  calculateGraphStats,
  getNodeNeighbors,
} from './GraphVisualization.utils';
import { LoadingState } from './LoadingState';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  mode = 'mini',
  title,
  subtitle,
  onNodePress,
  onEdgePress,
  onExpandPress,
  showLabels = true,
  showEdgeLabels = false,
  enablePhysics = true,
  maxVisibleNodes = 100,
  maxVisibleEdges = 150,
  height: customHeight,
  width: customWidth,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [baseLayout, setBaseLayout] = useState<GraphNode[] | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutProgress, setLayoutProgress] = useState(0);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusProgress, setFocusProgress] = useState(0);

  // Determine dimensions based on mode
  const width = customWidth || (mode === 'mini' ? SCREEN_WIDTH - 100 : SCREEN_WIDTH - 32);
  const height = customHeight || (mode === 'mini' ? 250 : 450);

  // Calculate graph stats
  const stats = useMemo(() => calculateGraphStats(data), [data]);

  // Store initial layout
  const [initialLayout, setInitialLayout] = useState<GraphNode[]>(data.nodes);

  // Pre-filter nodes and edges for performance
  const visibleNodesForLayout = useMemo(() => {
    return data.nodes.slice(0, maxVisibleNodes);
  }, [data.nodes, maxVisibleNodes]);

  const visibleEdgesForLayout = useMemo(() => {
    const nodeIds = new Set(visibleNodesForLayout.map(n => n.id));
    const filteredEdges = data.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));

    // Limit edges for performance
    if (filteredEdges.length > maxVisibleEdges) {
      const nodeDegrees = new Map<string, number>();
      filteredEdges.forEach(edge => {
        nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
        nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
      });

      const sortedEdges = [...filteredEdges].sort((a, b) => {
        const degreeA = (nodeDegrees.get(a.source) || 0) + (nodeDegrees.get(a.target) || 0);
        const degreeB = (nodeDegrees.get(b.source) || 0) + (nodeDegrees.get(b.target) || 0);
        return degreeB - degreeA;
      });

      return sortedEdges.slice(0, maxVisibleEdges);
    }

    return filteredEdges;
  }, [data.edges, visibleNodesForLayout, maxVisibleEdges]);

  // Apply base layout algorithm asynchronously to prevent UI freezing
  useEffect(() => {
    let isCancelled = false;

    if (!enablePhysics) {
      setInitialLayout(visibleNodesForLayout);
      setBaseLayout(visibleNodesForLayout);
      setIsLayouting(false);
      return;
    }

    // Set loading state immediately
    setIsLayouting(true);
    setLayoutProgress(0);

    const computeLayout = async () => {
      try {
        // Use async layout with progress updates - use filtered nodes and edges
        const layoutResult = await applyForceLayoutAsync(
          visibleNodesForLayout,
          visibleEdgesForLayout,
          width,
          height,
          {
            iterations: mode === 'mini' ? 50 : 100,
            repulsionStrength: mode === 'mini' ? 4000 : 5000,
            attractionStrength: 0.005,
          },
          (progress) => {
            if (!isCancelled) {
              setLayoutProgress(progress);
            }
          }
        );

        if (!isCancelled) {
          setInitialLayout(layoutResult);
          setBaseLayout(layoutResult);
          setIsLayouting(false);
          setLayoutProgress(100);
        }
      } catch (error) {
        console.error('Layout computation error:', error);
        if (!isCancelled) {
          setIsLayouting(false);
        }
      }
    };

    // Small delay to allow UI to render loading state first
    const timeoutId = setTimeout(computeLayout, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [visibleNodesForLayout, visibleEdgesForLayout, width, height, enablePhysics, mode]);

  // Store focused layout result
  const [focusedLayout, setFocusedLayout] = useState<GraphNode[] | null>(null);

  // Use focused layout if available, otherwise base layout
  const layoutNodes = useMemo(() => {
    if (focusedNodeId && focusedLayout) {
      return focusedLayout;
    }
    return baseLayout || initialLayout;
  }, [focusedNodeId, focusedLayout, baseLayout, initialLayout]);

  // Reset when unfocusing
  useEffect(() => {
    if (!focusedNodeId) {
      setFocusedLayout(null);
      if (initialLayout.length > 0) {
        setBaseLayout(initialLayout);
      }
    }
  }, [focusedNodeId, initialLayout]);

  // Filter visible edges with performance limit
  const visibleEdges = useMemo(() => {
    const nodeIds = new Set(layoutNodes.map(n => n.id));
    const filteredEdges = data.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));

    // Limit edges for performance - prioritize edges connected to nodes with more connections
    if (filteredEdges.length > maxVisibleEdges) {
      // Calculate node degrees (connection counts)
      const nodeDegrees = new Map<string, number>();
      filteredEdges.forEach(edge => {
        nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
        nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
      });

      // Sort edges by combined degree of source and target (more important edges first)
      const sortedEdges = [...filteredEdges].sort((a, b) => {
        const degreeA = (nodeDegrees.get(a.source) || 0) + (nodeDegrees.get(a.target) || 0);
        const degreeB = (nodeDegrees.get(b.source) || 0) + (nodeDegrees.get(b.target) || 0);
        return degreeB - degreeA;
      });

      return sortedEdges.slice(0, maxVisibleEdges);
    }

    return filteredEdges;
  }, [data.edges, layoutNodes, maxVisibleEdges]);

  const handleNodePress = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);

    // Toggle focus mode
    if (focusedNodeId === node.id) {
      // Double-click unfocuses
      setFocusedNodeId(null);
      setFocusedLayout(null);
      setBaseLayout(initialLayout);
    } else {
      // Show loading state FIRST
      setIsFocusing(true);
      setFocusProgress(0);

      // Use setTimeout to ensure loading state renders before computation starts
      setTimeout(async () => {
        const startTime = Date.now();
        const minLoadingTime = 50; // Minimum 50ms to ensure loading state is visible

        try {
          const focused = await applyFocusedLayoutAsync(
            visibleNodesForLayout,
            visibleEdgesForLayout,
            node.id,
            width,
            height,
            baseLayout || initialLayout,
            (progress) => {
              setFocusProgress(progress);
            }
          );

          // Set focused node and layout together
          setFocusedNodeId(node.id);
          setFocusedLayout(focused);

          // Ensure loading state shows for minimum duration
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minLoadingTime - elapsed);

          if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
          }
        } catch (error) {
          console.error('Error applying focused layout:', error);
        } finally {
          setIsFocusing(false);
        }
      }, 50); // Small delay to ensure UI renders loading state
    }

    onNodePress?.(node);
  }, [focusedNodeId, initialLayout, baseLayout, visibleNodesForLayout, visibleEdgesForLayout, width, height, onNodePress]);

  const handleResetFocus = useCallback(() => {
    setFocusedNodeId(null);
    setSelectedNodeId(null);
    setFocusedLayout(null);
    setBaseLayout(initialLayout);
  }, [initialLayout]);

  // Get neighbor IDs for highlighting
  const neighborIds = useMemo(() => {
    if (!focusedNodeId) return new Set<string>();
    return new Set(getNodeNeighbors(focusedNodeId, visibleEdges));
  }, [focusedNodeId, visibleEdges]);

  // Render edges
  const renderEdges = () => {
    return visibleEdges.map((edge, edgeIndex) => {
      const source = layoutNodes.find(n => n.id === edge.source);
      const target = layoutNodes.find(n => n.id === edge.target);

      if (!source || !target || source.x === undefined || source.y === undefined ||
          target.x === undefined || target.y === undefined) {
        return null;
      }

      // Highlight edges connected to focused node
      const isConnectedToFocus = focusedNodeId === edge.source || focusedNodeId === edge.target;
      const isHighlighted = isConnectedToFocus;

      // Show labels for first few edges in mini mode
      const isTopEdge = edgeIndex < 5;

      const color = isHighlighted ? '#3B82F6' : (edge.color || '#CBD5E1');
      const strokeWidth = isHighlighted ? 2.5 : (edge.width || 1.5);
      const opacity = isHighlighted ? 0.9 : (focusedNodeId ? 0.5 : 0.6);

      // Calculate arrow position (at 80% of the line to account for node size)
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const angle = Math.atan2(dy, dx);
      const targetNodeSize = getNodeSize(target, data.edges);
      const arrowDist = Math.sqrt(dx * dx + dy * dy) - targetNodeSize / 2 - 5;

      const arrowX = source.x + Math.cos(angle) * arrowDist;
      const arrowY = source.y + Math.sin(angle) * arrowDist;

      // Calculate label position - center of line
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      return (
        <G key={edge.id}>
          <Line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
          {edge.directed !== false && (
            // Arrow marker
            <Path
              d={`M ${arrowX} ${arrowY} L ${arrowX - 7 * Math.cos(angle - Math.PI / 6)} ${
                arrowY - 7 * Math.sin(angle - Math.PI / 6)
              } L ${arrowX - 7 * Math.cos(angle + Math.PI / 6)} ${
                arrowY - 7 * Math.sin(angle + Math.PI / 6)
              } Z`}
              fill={color}
              opacity={opacity}
            />
          )}
          {/* Edge labels - uniform rendering logic:
              - When focused: always show labels for highlighted (connected) edges
              - When not focused: show based on mode (mini: first 5, full: showEdgeLabels prop)
          */}
          {(edge.label || edge.type) && (
            focusedNodeId
              ? isHighlighted  // When focused, show labels for connected edges
              : (mode === 'mini' ? isTopEdge : showEdgeLabels)  // When not focused, use mode rules
          ) && (
            <G>
              {/* Label background rect for better visibility */}
              <SvgText
                x={midX}
                y={midY}
                fontSize={mode === 'mini' ? 10 : 12}
                fill="#FFFFFF"
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                stroke="#FFFFFF"
                strokeWidth={4}
                opacity={0.95}
              >
                {edge.label || edge.type}
              </SvgText>
              {/* Foreground label */}
              <SvgText
                x={midX}
                y={midY}
                fontSize={mode === 'mini' ? 10 : 12}
                fill={isHighlighted ? '#3B82F6' : '#1E293B'}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {edge.label || edge.type}
              </SvgText>
            </G>
          )}
        </G>
      );
    });
  };

  // Render nodes
  const renderNodes = () => {
    return layoutNodes.map((node, index) => {
      if (node.x === undefined || node.y === undefined) return null;

      const size = getNodeSize(node, data.edges);
      const radius = size / 2;
      const color = getNodeColor(node, index);
      const isFocused = focusedNodeId === node.id;
      const isNeighbor = neighborIds.has(node.id);
      const isSelected = selectedNodeId === node.id;
      const isDimmed = focusedNodeId && !isFocused && !isNeighbor;
      const label = getNodeLabel(node);

      // Show labels for first 10 nodes in mini mode to give users a feel for the data
      const isTopNode = index < 10;

      // Enhanced styling for focused node and neighbors
      const nodeOpacity = isDimmed ? 0.6 : 1;
      const strokeColor = isFocused ? '#10B981' : (isNeighbor ? '#3B82F6' : '#FFF');
      const strokeWidth = isFocused ? 4 : (isNeighbor ? 3 : 2);
      const nodeRadius = isFocused ? radius * 1.2 : radius;

      return (
        <G key={node.id}>
          {/* Outer glow for focused node */}
          {isFocused && (
            <Circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius + 8}
              fill="none"
              stroke="#10B981"
              strokeWidth={2}
              opacity={0.3}
            />
          )}

          {/* Node circle */}
          <Circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius}
            fill={color}
            opacity={nodeOpacity}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            {...(Platform.OS === 'web'
              ? { onClick: () => handleNodePress(node), style: { cursor: 'pointer' } }
              : { onPress: () => handleNodePress(node) }
            )}
          />

          {/* Node label */}
          {showLabels && (mode === 'full' || layoutNodes.length <= 20 || isFocused || isNeighbor || (mode === 'mini' && isTopNode)) && (
            <G pointerEvents="none">
              {/* Background for better readability */}
              {(isFocused || isNeighbor || (mode === 'mini' && isTopNode)) && (
                <SvgText
                  x={node.x}
                  y={node.y + nodeRadius + 14}
                  fontSize={mode === 'mini' ? 10 : 12}
                  fill="#FFFFFF"
                  fontWeight="700"
                  textAnchor="middle"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  pointerEvents="none"
                >
                  {label.length > 15 ? label.substring(0, 12) + '...' : label}
                </SvgText>
              )}
              {/* Foreground label */}
              <SvgText
                x={node.x}
                y={node.y + nodeRadius + 14}
                fontSize={mode === 'mini' ? 10 : 12}
                fill={isDimmed ? '#94A3B8' : '#1E293B'}
                fontWeight={isFocused || isNeighbor || (mode === 'mini' && isTopNode) ? '700' : '600'}
                textAnchor="middle"
                opacity={nodeOpacity}
                pointerEvents="none"
              >
                {label.length > 15 ? label.substring(0, 12) + '...' : label}
              </SvgText>
            </G>
          )}

          {/* Node text - show first 5 characters for better context */}
          <SvgText
            x={node.x}
            y={node.y + 5}
            fontSize={node.icon ? nodeRadius * 0.7 : Math.min(nodeRadius * 0.35, mode === 'mini' ? 8 : 10)}
            fill="#FFF"
            fontWeight="700"
            textAnchor="middle"
            opacity={nodeOpacity}
            pointerEvents="none"
          >
            {node.icon || (label.length > 5 ? label.substring(0, 5).toUpperCase() : label.toUpperCase())}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Loading state overlay */}
      {(isLayouting || isFocusing) && (
        <LoadingState
          message={
            isFocusing
              ? `Focusing node ${focusProgress > 0 ? `${focusProgress}%` : ''}...`
              : `Computing layout ${layoutProgress > 0 ? `${layoutProgress}%` : ''}...`
          }
          size={mode === 'mini' ? 'small' : 'medium'}
          overlay
          backgroundColor="rgba(255, 255, 255, 0.95)"
        />
      )}

      {/* Graph stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBadge}>
          <Text style={styles.statText}>{stats.totalNodes} nodes</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statText}>{stats.totalEdges} edges</Text>
        </View>
        {stats.totalNodes > maxVisibleNodes && (
          <View style={[styles.statBadge, styles.warningBadge]}>
            <Text style={styles.statText}>Showing {maxVisibleNodes}</Text>
          </View>
        )}
        {focusedNodeId && (
          <TouchableOpacity
            style={[styles.statBadge, styles.resetBadge]}
            onPress={handleResetFocus}
          >
            <Text style={styles.resetText}>↻ Reset View</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SVG Canvas */}
      <View style={[styles.svgContainer, { height }]}>
        <Svg width={width} height={height} style={styles.svg}>
          <Defs>
            <Marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
            </Marker>
          </Defs>

          {/* Render edges first (so nodes appear on top) */}
          <G>{renderEdges()}</G>

          {/* Render nodes */}
          <G>{renderNodes()}</G>
        </Svg>
      </View>

      {/* Expand button for mini mode */}
      {mode === 'mini' && onExpandPress && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
          <Text style={styles.expandButtonText}>🔍 View Full Graph</Text>
        </TouchableOpacity>
      )}

      {/* Legend for node types */}
      {mode === 'full' && Object.keys(stats.nodesByLabel).length > 0 && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Node Types:</Text>
          <View style={styles.legendItems}>
            {Object.entries(stats.nodesByLabel).map(([label, count], index) => (
              <View key={label} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: getNodeColor({ id: '', labels: [label], properties: {} }, index) },
                  ]}
                />
                <Text style={styles.legendText}>
                  {label} ({count})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  statBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  resetBadge: {
    backgroundColor: '#DCFCE7',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  svgContainer: {
    backgroundColor: '#FAFAFA',
  },
  svg: {
    backgroundColor: '#FAFAFA',
  },
  expandButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  expandButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  legendText: {
    fontSize: 11,
    color: '#475569',
  },
});
