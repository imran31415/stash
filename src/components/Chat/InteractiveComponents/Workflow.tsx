import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  LayoutChangeEvent,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  Animated,
  Modal,
} from 'react-native';
import Svg, { Rect, Path, Text as SvgText, Defs, Marker, G, Circle, LinearGradient, Stop } from 'react-native-svg';
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
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  const isDragging = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);
  const containerRef = useRef<any>(null);
  const isDraggingMouse = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartPan = useRef({ x: 0, y: 0 });

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
  const stats = useMemo(() => data ? calculateWorkflowStats(data) : { totalNodes: 0, totalEdges: 0, layers: 0 }, [data]);

  // Calculate critical path if needed
  const criticalPath = useMemo(() => {
    if (highlightCriticalPath && data?.nodes && data?.edges) {
      return new Set(findCriticalPath(data.nodes, data.edges));
    }
    return new Set<string>();
  }, [data?.nodes, data?.edges, highlightCriticalPath]);

  // Calculate layout
  const positionedNodes = useMemo<PositionedNode[]>(() => {
    if (!data?.nodes || !data?.edges) return [];
    return calculateLayeredLayout(data.nodes, data.edges, {
      width: width || 0,
      height: height || 0,
      nodeWidth,
      nodeHeight,
      horizontalSpacing,
      verticalSpacing,
      orientation,
      algorithm: layoutAlgorithm,
    });
  }, [data?.nodes, data?.edges, width, height, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing, orientation, layoutAlgorithm]);

  // Calculate positioned edges
  const positionedEdges = useMemo<PositionedEdge[]>(() => {
    if (!data?.edges || !positionedNodes.length) return [];
    return calculatePositionedEdges(data.edges, positionedNodes, nodeWidth, nodeHeight, orientation);
  }, [data?.edges, positionedNodes, nodeWidth, nodeHeight, orientation]);

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
      // Don't select node if we were dragging
      if (isDragging.current) return;

      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setBottomSheetVisible(true);

      // Animate bottom sheet up
      Animated.spring(bottomSheetAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      onNodePress?.(node);
    },
    [onNodePress, bottomSheetAnim]
  );

  const handleCloseBottomSheet = useCallback(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
      setSelectedNodeId(null);
    });
  }, [bottomSheetAnim]);

  const handleEdgePress = useCallback(
    (edge: WorkflowEdge) => {
      // Don't select edge if we were dragging
      if (isDragging.current) return;

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

  // Pan responder for drag-to-pan functionality
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isMini,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start panning if the gesture has moved more than 5 pixels
        return !isMini && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: (_, gestureState) => {
        isDragging.current = false;
        lastPanRef.current = { x: panX, y: panY };
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isMini) {
          isDragging.current = true;
          // Pan in the opposite direction of the drag for natural feel
          setPanX(lastPanRef.current.x - gestureState.dx / zoom);
          setPanY(lastPanRef.current.y - gestureState.dy / zoom);
        }
      },
      onPanResponderRelease: () => {
        // Small delay to prevent click events after drag
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
      onPanResponderTerminate: () => {
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    })
  ).current;

  // Handle scroll-to-zoom for web
  const handleWheel = useCallback(
    (event: any) => {
      if (isMini || Platform.OS !== 'web') return;

      event.preventDefault();

      const delta = event.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;

      setZoom((prev) => {
        const newZoom = Math.max(0.5, Math.min(prev * zoomFactor, 3));
        return newZoom;
      });
    },
    [isMini]
  );

  // Mouse event handlers for web drag-to-pan
  const handleMouseDown = useCallback(
    (event: any) => {
      if (isMini || Platform.OS !== 'web') return;

      event.preventDefault();
      isDraggingMouse.current = true;
      isDragging.current = false;
      dragStartPos.current = { x: event.clientX, y: event.clientY };
      dragStartPan.current = { x: panX, y: panY };

      // Change cursor to grabbing
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    },
    [isMini, panX, panY]
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      if (isMini || Platform.OS !== 'web' || !isDraggingMouse.current) return;

      event.preventDefault();

      const deltaX = event.clientX - dragStartPos.current.x;
      const deltaY = event.clientY - dragStartPos.current.y;

      // If mouse has moved more than 3 pixels, consider it a drag
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        isDragging.current = true;
      }

      // Update pan position based on drag
      const newPanX = dragStartPan.current.x + deltaX / zoom;
      const newPanY = dragStartPan.current.y + deltaY / zoom;

      setPanX(newPanX);
      setPanY(newPanY);
    },
    [isMini, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (Platform.OS !== 'web') return;

    isDraggingMouse.current = false;

    // Restore cursor to grab
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }

    // Small delay to prevent click events after drag
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (Platform.OS !== 'web') return;

    isDraggingMouse.current = false;

    // Restore cursor to grab
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }

    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  }, []);

  // Add event listeners for web
  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current && !isMini) {
      const element = containerRef.current;

      // Wheel event on the container
      element.addEventListener('wheel', handleWheel, { passive: false });

      // Mouse down on the container
      element.addEventListener('mousedown', handleMouseDown);

      // Mouse move and up on document for better tracking
      // This ensures we capture events even if mouse moves outside container
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        element.removeEventListener('wheel', handleWheel);
        element.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, isMini]);

  // Handle pinch-to-zoom for mobile
  const handleTouchMove = useCallback(
    (event: any) => {
      if (isMini || Platform.OS === 'web') return;

      const touches = event.nativeEvent.touches;
      if (touches.length === 2) {
        // Calculate distance between two touches
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
        );

        if (lastPinchDistance.current !== null) {
          const delta = distance - lastPinchDistance.current;
          const zoomFactor = delta > 0 ? 1.01 : 0.99;

          setZoom((prev) => {
            const newZoom = Math.max(0.5, Math.min(prev * zoomFactor, 3));
            return newZoom;
          });
        }

        lastPinchDistance.current = distance;
      }
    },
    [isMini]
  );

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
  }, []);

  const renderNode = (node: PositionedNode) => {
    const isSelected = selectedNodeId === node.id;
    const isOnCriticalPath = criticalPath.has(node.id);
    const color = getNodeColor(node, showStatus);
    const icon = getNodeIcon(node);
    const label = getNodeLabel(node, isMini ? 12 : 16);

    // Modern gradient colors based on node type/status
    const getGradientColors = () => {
      if (node.status === 'running') {
        return { start: '#3B82F6', end: '#1D4ED8' }; // Blue gradient
      } else if (node.status === 'success') {
        return { start: '#10B981', end: '#059669' }; // Green gradient
      } else if (node.status === 'failed') {
        return { start: '#EF4444', end: '#DC2626' }; // Red gradient
      } else if (node.status === 'waiting') {
        return { start: '#F59E0B', end: '#D97706' }; // Amber gradient
      }
      return { start: '#6B7280', end: '#4B5563' }; // Gray gradient
    };

    const gradient = getGradientColors();
    const gradientId = `node-gradient-${node.id}`;

    return (
      <G
        key={node.id}
        {...(Platform.OS === 'web'
          ? { onClick: () => handleNodePress(node) }
          : { onPress: () => handleNodePress(node) }
        )}
      >
        {/* Outer glow effect for selected/critical path */}
        {(isSelected || isOnCriticalPath) && (
          <Rect
            x={node.x - 4}
            y={node.y - 4}
            width={nodeWidth + 8}
            height={nodeHeight + 8}
            fill="none"
            stroke={isSelected ? '#3B82F6' : '#FCD34D'}
            strokeWidth={2}
            rx={12}
            ry={12}
            opacity={0.4}
          />
        )}

        {/* Node background with gradient */}
        <Rect
          x={node.x}
          y={node.y}
          width={nodeWidth}
          height={nodeHeight}
          fill={`url(#${gradientId})`}
          stroke={isSelected ? '#3B82F6' : isOnCriticalPath ? '#FCD34D' : 'rgba(255,255,255,0.3)'}
          strokeWidth={isSelected ? 2.5 : isOnCriticalPath ? 2 : 1}
          rx={10}
          ry={10}
          opacity={0.95}
        />

        {/* Glassmorphism overlay */}
        <Rect
          x={node.x}
          y={node.y}
          width={nodeWidth}
          height={nodeHeight}
          fill="rgba(255, 255, 255, 0.1)"
          rx={10}
          ry={10}
        />

        {/* Node icon */}
        <SvgText
          x={node.x + nodeWidth / 2}
          y={node.y + nodeHeight / 2 - (showLabels ? 10 : 0)}
          fontSize={isMini ? 18 : 24}
          fill="#FFFFFF"
          textAnchor="middle"
          alignmentBaseline="middle"
          opacity={0.95}
        >
          {icon}
        </SvgText>

        {/* Node label */}
        {showLabels && (
          <SvgText
            x={node.x + nodeWidth / 2}
            y={node.y + nodeHeight / 2 + 14}
            fontSize={isMini ? 10 : 12}
            fontWeight="600"
            fill="#FFFFFF"
            textAnchor="middle"
            alignmentBaseline="middle"
            opacity={0.9}
          >
            {label}
          </SvgText>
        )}

        {/* Status indicator with glow */}
        {showStatus && node.status && (
          <G>
            {/* Glow effect */}
            <Circle
              cx={node.x + nodeWidth - 10}
              cy={node.y + 10}
              r={8}
              fill={
                node.status === 'running'
                  ? '#3B82F6'
                  : node.status === 'success'
                  ? '#10B981'
                  : node.status === 'failed'
                  ? '#EF4444'
                  : '#9CA3AF'
              }
              opacity={0.3}
            />
            {/* Main indicator */}
            <Circle
              cx={node.x + nodeWidth - 10}
              cy={node.y + 10}
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
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth={2}
            />
          </G>
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
    const edgeGradientId = `edge-gradient-${edge.id}`;

    // Determine edge style based on condition type
    const getEdgeStyle = () => {
      if (isOnCriticalPath) {
        return {
          stroke: `url(#${edgeGradientId}-critical)`,
          width: isSelected ? 3.5 : 3,
        };
      } else if (isSelected) {
        return {
          stroke: `url(#${edgeGradientId})`,
          width: 3,
        };
      } else if (edge.conditionType === 'failure') {
        return {
          stroke: 'rgba(239, 68, 68, 0.6)', // Red with transparency
          width: edge.width || 2,
        };
      } else if (edge.conditionType === 'success') {
        return {
          stroke: 'rgba(16, 185, 129, 0.6)', // Green with transparency
          width: edge.width || 2,
        };
      }
      return {
        stroke: 'rgba(107, 114, 128, 0.5)', // Gray with transparency
        width: edge.width || 2,
      };
    };

    const edgeStyle = getEdgeStyle();

    return (
      <G key={edge.id}>
        {/* Edge shadow/glow for selected edges */}
        {isSelected && (
          <Path
            d={edge.path}
            stroke={isOnCriticalPath ? '#FCD34D' : '#3B82F6'}
            strokeWidth={6}
            fill="none"
            opacity={0.2}
          />
        )}

        {/* Main edge path */}
        <Path
          d={edge.path}
          stroke={edgeStyle.stroke}
          strokeWidth={edgeStyle.width}
          fill="none"
          markerEnd={`url(#arrowhead-${isOnCriticalPath ? 'critical' : edge.conditionType || 'default'})`}
          strokeDasharray={strokeDashArray}
          opacity={isSelected ? 1 : 0.85}
        />

        {/* Edge label with background */}
        {showEdgeLabels && edge.label && (
          <G>
            {/* Label background */}
            <Rect
              x={(edge.sourceX + edge.targetX) / 2 - 20}
              y={(edge.sourceY + edge.targetY) / 2 - 12}
              width={40}
              height={18}
              fill="rgba(255, 255, 255, 0.95)"
              stroke="rgba(107, 114, 128, 0.3)"
              strokeWidth={1}
              rx={4}
            />
            {/* Label text */}
            <SvgText
              x={(edge.sourceX + edge.targetX) / 2}
              y={(edge.sourceY + edge.targetY) / 2 - 3}
              fontSize={isMini ? 9 : 10}
              fontWeight="500"
              fill="#374151"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {edge.label}
            </SvgText>
          </G>
        )}
      </G>
    );
  };

  const renderBottomSheet = () => {
    if (!bottomSheetVisible || !selectedNodeId) return null;

    const node = data?.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const translateY = bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [500, 0],
    });

    const backdropOpacity = bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    });

    return (
      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseBottomSheet}
      >
        <TouchableOpacity
          style={styles.bottomSheetBackdrop}
          activeOpacity={1}
          onPress={handleCloseBottomSheet}
        >
          <Animated.View style={[styles.bottomSheetBackdropOverlay, { opacity: backdropOpacity }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.bottomSheetHandle}>
            <View style={styles.bottomSheetHandlebar} />
          </View>

          {/* Header */}
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHeaderContent}>
              <Text style={styles.bottomSheetIcon}>{getNodeIcon(node)}</Text>
              <View style={styles.bottomSheetHeaderText}>
                <Text style={styles.bottomSheetTitle}>{node.label}</Text>
                <Text style={styles.bottomSheetSubtitle}>{node.type}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bottomSheetCloseButton}
              onPress={handleCloseBottomSheet}
            >
              <Text style={styles.bottomSheetCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.bottomSheetContent}>
            {node.description && (
              <View style={styles.bottomSheetRow}>
                <Text style={styles.bottomSheetLabel}>Description</Text>
                <Text style={styles.bottomSheetValue}>{node.description}</Text>
              </View>
            )}

            {node.status && (
              <View style={styles.bottomSheetRow}>
                <Text style={styles.bottomSheetLabel}>Status</Text>
                <View style={styles.bottomSheetStatusBadge}>
                  <View
                    style={[
                      styles.bottomSheetStatusIndicator,
                      {
                        backgroundColor:
                          node.status === 'running'
                            ? '#60A5FA'
                            : node.status === 'success'
                            ? '#34D399'
                            : node.status === 'failed'
                            ? '#F87171'
                            : node.status === 'waiting'
                            ? '#FBBF24'
                            : '#9CA3AF',
                      },
                    ]}
                  />
                  <Text style={styles.bottomSheetStatusText}>{node.status}</Text>
                </View>
              </View>
            )}

            {node.metadata && (
              <>
                {node.metadata.duration !== undefined && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>Duration</Text>
                    <Text style={styles.bottomSheetValue}>
                      {formatDuration(node.metadata.duration)}
                    </Text>
                  </View>
                )}

                {node.metadata.startTime && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>Start Time</Text>
                    <Text style={styles.bottomSheetValue}>
                      {new Date(node.metadata.startTime).toLocaleString()}
                    </Text>
                  </View>
                )}

                {node.metadata.endTime && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>End Time</Text>
                    <Text style={styles.bottomSheetValue}>
                      {new Date(node.metadata.endTime).toLocaleString()}
                    </Text>
                  </View>
                )}

                {node.metadata.retries !== undefined && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>Retries</Text>
                    <Text style={styles.bottomSheetValue}>{node.metadata.retries}</Text>
                  </View>
                )}

                {node.metadata.error && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>Error</Text>
                    <Text style={[styles.bottomSheetValue, styles.errorText]}>
                      {node.metadata.error}
                    </Text>
                  </View>
                )}

                {node.metadata.logs && (
                  <View style={styles.bottomSheetRow}>
                    <Text style={styles.bottomSheetLabel}>Logs</Text>
                    <View style={styles.bottomSheetLogsContainer}>
                      <Text style={styles.bottomSheetLogsText}>{node.metadata.logs}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </Modal>
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
      <View
        ref={containerRef}
        style={styles.svgContainer}
        {...(isMini || Platform.OS === 'web' ? {} : panResponder.panHandlers)}
        {...(Platform.OS !== 'web' ? { onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd } : {})}
      >
        <Svg
          width={isMini ? (width || 0) : (width || 0) * zoom}
          height={isMini ? ((height || 0) - (title || subtitle ? 60 : 0)) : ((height || 0) - (title || subtitle ? 60 : 0) - (mode === 'full' ? 60 : 0)) * zoom}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            {/* Node gradients */}
            {positionedNodes.map((node) => {
              const getGradientColors = () => {
                if (node.status === 'running') {
                  return { start: '#3B82F6', end: '#1D4ED8' };
                } else if (node.status === 'success') {
                  return { start: '#10B981', end: '#059669' };
                } else if (node.status === 'failed') {
                  return { start: '#EF4444', end: '#DC2626' };
                } else if (node.status === 'waiting') {
                  return { start: '#F59E0B', end: '#D97706' };
                }
                return { start: '#6B7280', end: '#4B5563' };
              };
              const gradient = getGradientColors();
              return (
                <LinearGradient
                  key={`gradient-${node.id}`}
                  id={`node-gradient-${node.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor={gradient.start} stopOpacity="1" />
                  <Stop offset="1" stopColor={gradient.end} stopOpacity="1" />
                </LinearGradient>
              );
            })}

            {/* Edge gradients for selected edges */}
            {positionedEdges.map((edge) => (
              <G key={`edge-gradients-${edge.id}`}>
                <LinearGradient
                  id={`edge-gradient-${edge.id}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.8" />
                  <Stop offset="1" stopColor="#60A5FA" stopOpacity="0.8" />
                </LinearGradient>
                <LinearGradient
                  id={`edge-gradient-${edge.id}-critical`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <Stop offset="0" stopColor="#FCD34D" stopOpacity="0.9" />
                  <Stop offset="1" stopColor="#F59E0B" stopOpacity="0.9" />
                </LinearGradient>
              </G>
            ))}

            {/* Arrow markers for different edge types */}
            <Marker
              id="arrowhead-default"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="rgba(107, 114, 128, 0.7)" />
            </Marker>

            <Marker
              id="arrowhead-success"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="rgba(16, 185, 129, 0.8)" />
            </Marker>

            <Marker
              id="arrowhead-failure"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="rgba(239, 68, 68, 0.8)" />
            </Marker>

            <Marker
              id="arrowhead-critical"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Path d="M0,0 L0,6 L9,3 z" fill="#FCD34D" />
            </Marker>
          </Defs>

          {/* Render edges first (below nodes) */}
          {positionedEdges.map((edge) => renderEdge(edge))}

          {/* Render nodes */}
          {positionedNodes.map((node) => renderNode(node))}
        </Svg>
      </View>

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

      {/* Bottom Sheet for node details */}
      {renderBottomSheet()}

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
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
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
  svgContainer: {
    flex: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      } as any,
    }),
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  zoomButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontWeight: '700',
    color: '#6B7280',
  },
  panControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    padding: 4,
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  panHorizontal: {
    flexDirection: 'row',
    gap: 4,
  },
  panButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 8,
    margin: 1,
  },
  panButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
  bottomSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheetBackdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomSheetHandlebar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bottomSheetHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bottomSheetIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bottomSheetHeaderText: {
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  bottomSheetCloseButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomSheetContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomSheetRow: {
    marginBottom: 20,
  },
  bottomSheetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomSheetValue: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  bottomSheetStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  bottomSheetStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  bottomSheetStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  bottomSheetLogsContainer: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  bottomSheetLogsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#10B981',
    lineHeight: 18,
  },
});
