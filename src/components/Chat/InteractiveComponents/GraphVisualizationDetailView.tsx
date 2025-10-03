import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { GraphVisualizationDetailViewProps, GraphNode, GraphEdge } from './GraphVisualization.types';
import {
  applyForceLayout,
  applyForceLayoutAsync,
  applyFocusedLayout,
  applyFocusedLayoutAsync,
  getNodeColor,
  getNodeSize,
  getNodeLabel,
  calculateGraphStats,
  searchNodes,
  filterNodesByLabel,
  filterEdgesByType,
  getNodeNeighbors,
} from './GraphVisualization.utils';
import { LoadingState } from './LoadingState';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const GraphVisualizationDetailView: React.FC<GraphVisualizationDetailViewProps> = ({
  visible,
  data,
  title,
  subtitle,
  onClose,
  onNodePress,
  onEdgePress,
  showLabels = true,
  showEdgeLabels = false,
  enablePhysics = true,
  searchable = true,
  filterByLabel,
  filterByType,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [baseLayout, setBaseLayout] = useState<GraphNode[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutProgress, setLayoutProgress] = useState(0);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusProgress, setFocusProgress] = useState(0);
  const [activeFilters, setActiveFilters] = useState<{
    labels: string[];
    types: string[];
  }>({
    labels: filterByLabel || [],
    types: filterByType || [],
  });
  const width = SCREEN_WIDTH - 32;
  const height = SCREEN_HEIGHT - 250;

  // Calculate stats
  const stats = useMemo(() => calculateGraphStats(data), [data]);

  // Apply search and filters
  const filteredNodes = useMemo(() => {
    let nodes = data.nodes;

    // Apply search
    if (searchQuery.trim()) {
      nodes = searchNodes(nodes, searchQuery);
    }

    // Apply label filters
    if (activeFilters.labels.length > 0) {
      nodes = filterNodesByLabel(nodes, activeFilters.labels);
    }

    return nodes;
  }, [data.nodes, searchQuery, activeFilters.labels]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    let edges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Apply type filters
    if (activeFilters.types.length > 0) {
      edges = filterEdgesByType(edges, activeFilters.types);
    }

    // Limit edges for performance - prioritize edges connected to nodes with more connections
    const maxVisibleEdges = 200; // Higher limit for detail view
    if (edges.length > maxVisibleEdges) {
      // Calculate node degrees (connection counts)
      const nodeDegrees = new Map<string, number>();
      edges.forEach(edge => {
        nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
        nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
      });

      // Sort edges by combined degree of source and target (more important edges first)
      const sortedEdges = [...edges].sort((a, b) => {
        const degreeA = (nodeDegrees.get(a.source) || 0) + (nodeDegrees.get(a.target) || 0);
        const degreeB = (nodeDegrees.get(b.source) || 0) + (nodeDegrees.get(b.target) || 0);
        return degreeB - degreeA;
      });

      return sortedEdges.slice(0, maxVisibleEdges);
    }

    return edges;
  }, [data.edges, filteredNodes, activeFilters.types]);

  // Store initial layout
  const [initialLayout, setInitialLayout] = useState<GraphNode[]>(filteredNodes);

  // Apply base layout asynchronously
  useEffect(() => {
    let isCancelled = false;

    if (!enablePhysics) {
      setInitialLayout(filteredNodes);
      setBaseLayout(filteredNodes);
      setIsLayouting(false);
      return;
    }

    // Set loading state immediately
    setIsLayouting(true);
    setLayoutProgress(0);

    const computeLayout = async () => {
      try {
        // Use async layout with progress updates
        const layoutResult = await applyForceLayoutAsync(
          filteredNodes,
          filteredEdges,
          width,
          height,
          {
            iterations: 100,
            repulsionStrength: 5000,
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
  }, [filteredNodes, filteredEdges, width, height, enablePhysics]);

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

  const handleNodePress = useCallback((node: GraphNode) => {
    console.log('[GraphVisualizationDetailView] Node pressed:', node.id);
    setSelectedNode(node);

    // Toggle focus mode
    if (focusedNodeId === node.id) {
      console.log('[GraphVisualizationDetailView] Unfocusing node');
      setFocusedNodeId(null);
      setFocusedLayout(null);
      setBaseLayout(initialLayout);
    } else {
      console.log('[GraphVisualizationDetailView] Focusing on node:', node.id);
      // Show loading state FIRST
      setIsFocusing(true);
      setFocusProgress(0);

      // Use setTimeout to ensure loading state renders before computation starts
      setTimeout(async () => {
        const startTime = Date.now();
        const minLoadingTime = 50; // Minimum 50ms to ensure loading state is visible

        try {
          console.log('[GraphVisualizationDetailView] Starting focused layout computation');
          const focused = await applyFocusedLayoutAsync(
            filteredNodes,
            filteredEdges,
            node.id,
            width,
            height,
            baseLayout || initialLayout,
            (progress) => {
              console.log('[GraphVisualizationDetailView] Focus progress:', progress);
              setFocusProgress(progress);
            }
          );

          console.log('[GraphVisualizationDetailView] Focused layout computed, applying...');
          // Set focused node and layout together
          setFocusedNodeId(node.id);
          setFocusedLayout(focused);
          console.log('[GraphVisualizationDetailView] Focused layout applied');

          // Ensure loading state shows for minimum duration
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minLoadingTime - elapsed);

          if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
          }
        } catch (error) {
          console.error('[GraphVisualizationDetailView] Error applying focused layout:', error);
        } finally {
          console.log('[GraphVisualizationDetailView] Hiding loading state');
          setIsFocusing(false);
        }
      }, 50); // Small delay to ensure UI renders loading state
    }

    onNodePress?.(node);
  }, [focusedNodeId, initialLayout, baseLayout, filteredNodes, filteredEdges, width, height, onNodePress]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.3, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.3, 0.3));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setFocusedNodeId(null);
    setSelectedNode(null);
    setFocusedLayout(null);
    setBaseLayout(initialLayout);
  }, [initialLayout]);

  // Get neighbor IDs for highlighting
  const neighborIds = useMemo(() => {
    if (!focusedNodeId) return new Set<string>();
    return new Set(getNodeNeighbors(focusedNodeId, filteredEdges));
  }, [focusedNodeId, filteredEdges]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Reset focus when search changes
    if (query !== searchQuery) {
      setFocusedNodeId(null);
      setFocusedLayout(null);
      setSelectedNode(null);
    }
  };

  const toggleLabelFilter = (label: string) => {
    setActiveFilters(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label],
    }));
    // Reset focus when filters change
    setFocusedNodeId(null);
    setFocusedLayout(null);
    setSelectedNode(null);
  };

  const clearFilters = () => {
    setActiveFilters({ labels: [], types: [] });
    setSearchQuery('');
    // Reset focus when clearing filters
    setFocusedNodeId(null);
    setFocusedLayout(null);
    setSelectedNode(null);
  };

  // Render edges
  const renderEdges = () => {
    return filteredEdges.map(edge => {
      const source = layoutNodes.find(n => n.id === edge.source);
      const target = layoutNodes.find(n => n.id === edge.target);

      if (!source || !target || source.x === undefined || source.y === undefined ||
          target.x === undefined || target.y === undefined) {
        return null;
      }

      // Highlight edges connected to focused node or between neighbors
      const isConnectedToFocus = focusedNodeId === edge.source || focusedNodeId === edge.target;
      const isConnectedToNeighbors = focusedNodeId &&
        neighborIds.has(edge.source) && neighborIds.has(edge.target);
      const isHighlighted = isConnectedToFocus;
      const isSecondary = isConnectedToNeighbors && !isConnectedToFocus;

      const color = isHighlighted ? '#3B82F6' : isSecondary ? '#10B981' : (edge.color || '#CBD5E1');
      const strokeWidth = isHighlighted ? 3.5 : isSecondary ? 3 : (edge.width || 2);
      const opacity = isHighlighted ? 1 : isSecondary ? 0.8 : (focusedNodeId ? 0.2 : 0.6);

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
            strokeWidth={strokeWidth / scale}
            opacity={opacity}
          />
          {edge.directed !== false && (
            <Path
              d={`M ${arrowX} ${arrowY} L ${arrowX - 8 * Math.cos(angle - Math.PI / 6)} ${
                arrowY - 8 * Math.sin(angle - Math.PI / 6)
              } L ${arrowX - 8 * Math.cos(angle + Math.PI / 6)} ${
                arrowY - 8 * Math.sin(angle + Math.PI / 6)
              } Z`}
              fill={color}
              opacity={opacity}
            />
          )}
          {/* Edge labels - show for primary and secondary edges when focused */}
          {(edge.label || edge.type) && (focusedNodeId ? (isHighlighted || isSecondary) : showEdgeLabels) ? (
            <G>
              {/* Background for label - enhanced for better visibility */}
              <SvgText
                x={midX}
                y={midY}
                fontSize={14 / scale}
                fill="#FFFFFF"
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                stroke="#FFFFFF"
                strokeWidth={6 / scale}
                opacity={1}
              >
                {edge.label || edge.type}
              </SvgText>
              {/* Foreground label */}
              <SvgText
                x={midX}
                y={midY}
                fontSize={14 / scale}
                fill={isHighlighted ? '#3B82F6' : isSecondary ? '#10B981' : '#1E293B'}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {edge.label || edge.type}
              </SvgText>
            </G>
          ) : null}
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
      const isSelected = selectedNode?.id === node.id;
      const isDimmed = focusedNodeId && !isFocused && !isNeighbor;
      const label = getNodeLabel(node);

      // Check if node has enough space for label (avoid overlapping text)
      // Calculate minimum distance to nearest neighbor
      const minLabelDistance = 60; // Minimum distance in pixels to show label
      let hasSpaceForLabel = true;

      // Only check distance for non-focused, non-neighbor nodes
      if (!isFocused && !isNeighbor) {
        for (let i = 0; i < layoutNodes.length; i++) {
          if (i === index) continue;
          const other = layoutNodes[i];
          if (other.x === undefined || other.y === undefined) continue;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minLabelDistance) {
            hasSpaceForLabel = false;
            break;
          }
        }
      }

      // Enhanced styling for focused node and neighbors
      const nodeOpacity = isDimmed ? 0.6 : 1;
      const strokeColor = isFocused ? '#10B981' : (isNeighbor ? '#3B82F6' : '#FFF');
      const strokeWidth = isFocused ? 4 : (isNeighbor ? 3 : 2);
      const nodeRadius = isFocused ? radius * 1.3 : radius;

      return (
        <G key={node.id}>
          {/* Shadow for 3D depth effect */}
          <Circle
            cx={node.x + 2 / scale}
            cy={node.y + 3 / scale}
            r={(nodeRadius + 1) / scale}
            fill="url(#nodeShadowDetail)"
            opacity={isDimmed ? 0.3 : 0.5}
          />

          {/* Multi-layer glow for focused node */}
          {isFocused && (
            <>
              <Circle
                cx={node.x}
                cy={node.y}
                r={(nodeRadius + 14) / scale}
                fill="none"
                stroke="#10B981"
                strokeWidth={3 / scale}
                opacity={0.2}
              />
              <Circle
                cx={node.x}
                cy={node.y}
                r={(nodeRadius + 10) / scale}
                fill="none"
                stroke="#10B981"
                strokeWidth={2 / scale}
                opacity={0.4}
              />
            </>
          )}

          {/* Subtle glow for neighbor nodes */}
          {isNeighbor && !isFocused && (
            <Circle
              cx={node.x}
              cy={node.y}
              r={(nodeRadius + 7) / scale}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2 / scale}
              opacity={0.3}
            />
          )}

          {/* Main node circle */}
          <Circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius / scale}
            fill={color}
            opacity={nodeOpacity}
            stroke={strokeColor}
            strokeWidth={strokeWidth / scale}
            onPress={() => {
              console.log('[GraphVisualizationDetailView] Circle pressed:', node.id);
              handleNodePress(node);
            }}
          />

          {/* Node label - only show if there's space or it's important (focused/neighbor) */}
          {showLabels && (isFocused || isNeighbor || hasSpaceForLabel) && (
            <G pointerEvents="none">
              {/* Background for better readability */}
              {(isFocused || isNeighbor) && (
                <SvgText
                  x={node.x}
                  y={node.y + nodeRadius / scale + 18 / scale}
                  fontSize={14 / scale}
                  fill="#FFFFFF"
                  fontWeight="700"
                  textAnchor="middle"
                  stroke="#FFFFFF"
                  strokeWidth={4 / scale}
                  pointerEvents="none"
                >
                  {label.length > 15 ? label.substring(0, 12) + '...' : label}
                </SvgText>
              )}
              {/* Foreground label */}
              <SvgText
                x={node.x}
                y={node.y + nodeRadius / scale + 18 / scale}
                fontSize={(isFocused || isNeighbor ? 14 : 12) / scale}
                fill={isDimmed ? '#94A3B8' : '#1E293B'}
                fontWeight={isFocused || isNeighbor ? '700' : '600'}
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
            y={node.y + 5 / scale}
            fontSize={node.icon ? (nodeRadius * 0.6) / scale : Math.min((nodeRadius * 0.35) / scale, 10 / scale)}
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title || 'Graph Visualization'}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search and filters */}
        {searchable && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search nodes..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor="#94A3B8"
            />
            {(searchQuery || activeFilters.labels.length > 0) && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats and filters */}
        <View style={styles.toolbar}>
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {filteredNodes.length}/{stats.totalNodes} nodes • {filteredEdges.length}/
              {stats.totalEdges} edges
            </Text>
            {focusedNodeId && (
              <Text style={styles.focusIndicator}>
                🎯 Focus Mode: {getNodeLabel(layoutNodes.find(n => n.id === focusedNodeId) || { id: '', labels: [], properties: {} })}
              </Text>
            )}
          </View>

          {/* Label filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {Object.keys(stats.nodesByLabel).map((label, index) => {
              const isActive = activeFilters.labels.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => toggleLabelFilter(label)}
                >
                  <View
                    style={[
                      styles.filterChipColor,
                      {
                        backgroundColor: getNodeColor(
                          { id: '', labels: [label], properties: {} },
                          index
                        ),
                      },
                    ]}
                  />
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable content area */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
          {/* Loading state overlay */}
          {(isLayouting || isFocusing) && (
            <LoadingState
              message={
                isFocusing
                  ? `Focusing node ${focusProgress > 0 ? `${focusProgress}%` : ''}...`
                  : `Computing layout ${layoutProgress > 0 ? `${layoutProgress}%` : ''}...`
              }
              size="large"
              overlay
              backgroundColor="rgba(255, 255, 255, 0.95)"
            />
          )}

          {/* Graph Canvas */}
          <View style={[styles.graphContainer, { height: selectedNode ? height : height + 150 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: width * scale, height: height * scale }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ width: width * scale, height: height * scale }}
              >
                <Svg
                  width={width * scale}
                  height={height * scale}
                  style={styles.svg}
                >
                  <Defs>
                    {/* Radial gradients for subtle 3D node effect */}
                    <RadialGradient id="nodeGradientDetail" cx="30%" cy="30%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                      <Stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
                    </RadialGradient>

                    {/* Shadow gradient for subtle depth */}
                    <RadialGradient id="nodeShadowDetail" cx="50%" cy="50%">
                      <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                      <Stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
                    </RadialGradient>
                  </Defs>

                  <G transform={`scale(${scale})`}>
                    {renderEdges()}
                    {renderNodes()}
                  </G>
                </Svg>
              </ScrollView>
            </ScrollView>

            {/* Zoom controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetView} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>⟲</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected node details */}
          {selectedNode && (() => {
            // Get all edges connected to this node
            const connectedEdges = filteredEdges.filter(
              edge => edge.source === selectedNode.id || edge.target === selectedNode.id
            );
            const outgoingEdges = connectedEdges.filter(edge => edge.source === selectedNode.id);
            const incomingEdges = connectedEdges.filter(edge => edge.target === selectedNode.id);

            return (
              <View style={styles.nodeDetails}>
                <View style={styles.nodeDetailsHeader}>
                  <Text style={styles.nodeDetailsTitle}>{getNodeLabel(selectedNode)}</Text>
                  <TouchableOpacity onPress={() => setSelectedNode(null)}>
                    <Text style={styles.nodeDetailsClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.nodeDetailsLabels}>
                  {selectedNode.labels.map(label => (
                    <View key={label} style={styles.nodeDetailsLabel}>
                      <Text style={styles.nodeDetailsLabelText}>{label}</Text>
                    </View>
                  ))}
                </View>

                {/* Connection Summary */}
                <View style={styles.connectionSummary}>
                  <Text style={styles.connectionSummaryText}>
                    {connectedEdges.length} connection{connectedEdges.length !== 1 ? 's' : ''}
                    ({outgoingEdges.length} outgoing, {incomingEdges.length} incoming)
                  </Text>
                </View>

                {/* Relationships Section */}
                {connectedEdges.length > 0 && (
                  <View style={styles.relationshipsSection}>
                    <Text style={styles.sectionTitle}>Relationships</Text>
                    <ScrollView style={styles.relationshipsList} nestedScrollEnabled>
                      {outgoingEdges.map(edge => {
                        const targetNode = filteredNodes.find(n => n.id === edge.target);
                        return (
                          <View key={edge.id} style={styles.relationshipRow}>
                            <Text style={styles.relationshipArrow}>→</Text>
                            <View style={styles.relationshipInfo}>
                              <Text style={styles.relationshipType}>{edge.label || edge.type}</Text>
                              <Text style={styles.relationshipTarget}>
                                {targetNode ? getNodeLabel(targetNode) : edge.target}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                      {incomingEdges.map(edge => {
                        const sourceNode = filteredNodes.find(n => n.id === edge.source);
                        return (
                          <View key={edge.id} style={styles.relationshipRow}>
                            <Text style={styles.relationshipArrow}>←</Text>
                            <View style={styles.relationshipInfo}>
                              <Text style={styles.relationshipType}>{edge.label || edge.type}</Text>
                              <Text style={styles.relationshipTarget}>
                                {sourceNode ? getNodeLabel(sourceNode) : edge.source}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Properties Section */}
                {Object.keys(selectedNode.properties).length > 0 && (
                  <View style={styles.propertiesSection}>
                    <Text style={styles.sectionTitle}>Properties</Text>
                    <View style={styles.nodeDetailsPropertiesContainer}>
                      {Object.entries(selectedNode.properties).map(([key, value]) => (
                        <View key={key} style={styles.propertyRow}>
                          <Text style={styles.propertyKey}>{key}:</Text>
                          <Text style={styles.propertyValue}>{String(value)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  clearButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  toolbar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stats: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  focusIndicator: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#DBEAFE',
  },
  filterChipColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  graphContainer: {
    backgroundColor: '#FAFAFA',
  },
  svg: {
    backgroundColor: '#FAFAFA',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  zoomButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  zoomButtonText: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '600',
  },
  nodeDetails: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 20,
  },
  nodeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  nodeDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  nodeDetailsClose: {
    fontSize: 20,
    color: '#64748B',
  },
  nodeDetailsLabels: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  nodeDetailsLabel: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nodeDetailsLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
  connectionSummary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  connectionSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  relationshipsSection: {
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  relationshipsList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  relationshipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  relationshipArrow: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 2,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  relationshipTarget: {
    fontSize: 12,
    color: '#64748B',
  },
  propertiesSection: {
    paddingBottom: 12,
  },
  nodeDetailsPropertiesContainer: {
    paddingHorizontal: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    gap: 8,
  },
  propertyKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    width: 100,
  },
  propertyValue: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
  },
});
