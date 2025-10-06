import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { useThemeColors } from '../../../theme';
import type {
  NetworkTopologyProps,
  NetworkNode,
  NetworkConnection,
} from './NetworkTopology.types';
import {
  calculateNetworkStats,
  getNodeIcon,
  getNodeStatusColor,
  getConnectionStatusColor,
  getConnectionStrokeDashArray,
  calculateHierarchicalLayout,
  calculateCircularLayout,
  calculateForceLayout,
  formatBandwidth,
  formatLatency,
} from './NetworkTopology.utils';

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  data,
  mode = 'mini',
  layout = 'hierarchical',
  height = 400,
  width,
  showLabels = true,
  showStatus = true,
  onNodePress,
  onConnectionPress,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';

  const stats = useMemo(() => calculateNetworkStats(data), [data]);

  const diagramWidth = width || (isMini ? 350 : 600);
  const diagramHeight = isMini ? 250 : 400;

  const nodePositions = useMemo(() => {
    switch (layout) {
      case 'hierarchical':
        return calculateHierarchicalLayout(data.nodes, data.connections, diagramWidth, diagramHeight);
      case 'circular':
        return calculateCircularLayout(data.nodes, diagramWidth, diagramHeight);
      case 'force':
      default:
        return calculateForceLayout(data.nodes, data.connections, diagramWidth, diagramHeight);
    }
  }, [data, layout, diagramWidth, diagramHeight]);

  const renderConnection = (connection: NetworkConnection) => {
    const sourcePos = nodePositions.get(connection.source);
    const targetPos = nodePositions.get(connection.target);

    if (!sourcePos || !targetPos) return null;

    const connectionColor = getConnectionStatusColor(connection);
    const strokeDashArray = getConnectionStrokeDashArray(connection);

    // Calculate midpoint for label
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;

    return (
      <React.Fragment key={connection.id}>
        <Line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={connectionColor}
          strokeWidth={2}
          strokeDasharray={strokeDashArray}
          opacity={0.6}
          onPress={() => onConnectionPress?.(connection)}
        />
        {connection.label && showLabels && !isMini && (
          <SvgText
            x={midX}
            y={midY - 5}
            fontSize={9}
            fill={colors.text}
            textAnchor="middle"
            backgroundColor="#FFFFFF"
          >
            {connection.label}
          </SvgText>
        )}
      </React.Fragment>
    );
  };

  const renderNode = (node: NetworkNode) => {
    const pos = nodePositions.get(node.id);
    if (!pos) return null;

    const nodeColor = getNodeStatusColor(node);
    const nodeRadius = isMini ? 20 : 25;
    const icon = getNodeIcon(node);

    return (
      <React.Fragment key={node.id}>
        <Circle
          cx={pos.x}
          cy={pos.y}
          r={nodeRadius}
          fill={nodeColor}
          stroke="#FFFFFF"
          strokeWidth={2}
          onPress={() => onNodePress?.(node)}
        />
        <SvgText
          x={pos.x}
          y={pos.y + 5}
          fontSize={isMini ? 14 : 16}
          textAnchor="middle"
        >
          {icon}
        </SvgText>
        {showLabels && (
          <SvgText
            x={pos.x}
            y={pos.y + nodeRadius + 15}
            fontSize={isMini ? 9 : 11}
            fill={colors.text}
            textAnchor="middle"
            fontWeight="600"
          >
            {node.label}
          </SvgText>
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.description && !isMini && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
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

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.onlineNodes}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Online</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.offlineNodes}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Offline</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalConnections}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Links</Text>
        </View>
        {!isMini && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.errorNodes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Errors</Text>
          </View>
        )}
      </View>

      {/* Network diagram */}
      <ScrollView
        style={styles.diagramContainer}
        contentContainerStyle={styles.diagramContent}
        showsHorizontalScrollIndicator={!isMini}
        showsVerticalScrollIndicator={!isMini}
      >
        <View style={[styles.svgContainer, { backgroundColor: colors.background }]}>
          <Svg width={diagramWidth} height={diagramHeight}>
            {/* Render connections first (behind nodes) */}
            {data.connections.map((connection) => renderConnection(connection))}

            {/* Render nodes */}
            {data.nodes.map((node) => renderNode(node))}
          </Svg>
        </View>
      </ScrollView>

      {/* Legend */}
      {!isMini && showStatus && (
        <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Status</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendLabel, { color: colors.text }]}>Online</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendLabel, { color: colors.text }]}>Warning</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendLabel, { color: colors.text }]}>Error</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
              <Text style={[styles.legendLabel, { color: colors.text }]}>Offline</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  diagramContainer: {
    flex: 1,
  },
  diagramContent: {
    padding: 16,
  },
  svgContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  legend: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
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
  },
  legendLabel: {
    fontSize: 12,
  },
});
