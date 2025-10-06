import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { useThemeColors } from '../../../theme';
import type { SankeyDiagramProps, SankeyNode, SankeyLink } from './SankeyDiagram.types';
import {
  calculateSankeyStats,
  calculateSankeyLayout,
  getNodeColor,
  getLinkColor,
  formatNumber,
  formatPercentage,
} from './SankeyDiagram.utils';

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  data,
  mode = 'mini',
  orientation = 'horizontal',
  height = 400,
  width,
  showValues = true,
  showLabels = true,
  onNodePress,
  onLinkPress,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';

  const stats = useMemo(() => calculateSankeyStats(data), [data]);

  const diagramWidth = width || (isMini ? 350 : 600);
  const diagramHeight = isMini ? 250 : 400;

  const layout = useMemo(
    () => calculateSankeyLayout(data, diagramWidth, diagramHeight, orientation),
    [data, diagramWidth, diagramHeight, orientation]
  );

  const renderNode = (node: typeof layout.nodes[0], index: number) => {
    const nodeColor = getNodeColor(node, index);
    const originalNode = data.nodes.find((n) => n.id === node.id);

    return (
      <React.Fragment key={node.id}>
        <Rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fill={nodeColor}
          rx={4}
          onPress={() => originalNode && onNodePress?.(originalNode)}
        />
        {showLabels && (
          <SvgText
            x={node.x + node.width + 8}
            y={node.y + node.height / 2}
            fontSize={isMini ? 10 : 12}
            fill={colors.text}
            textAnchor="start"
            alignmentBaseline="middle"
          >
            {node.label}
          </SvgText>
        )}
        {showValues && !isMini && (
          <SvgText
            x={node.x + node.width / 2}
            y={node.y + node.height / 2}
            fontSize={10}
            fill="#FFFFFF"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontWeight="700"
          >
            {formatNumber(Math.max(node.incomingValue, node.outgoingValue))}
          </SvgText>
        )}
      </React.Fragment>
    );
  };

  const renderLink = (link: typeof layout.links[0]) => {
    const linkColor = getLinkColor(link, link.sourceNode);
    const originalLink = data.links.find((l) => l.id === link.id);

    return (
      <Path
        key={link.id}
        d={link.path}
        stroke={linkColor}
        strokeWidth={Math.max(2, link.width)}
        fill="none"
        opacity={0.5}
        onPress={() => originalLink && onLinkPress?.(originalLink)}
      />
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
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalNodes}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nodes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalLinks}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Links</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{formatNumber(stats.totalFlow)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Flow</Text>
        </View>
        {!isMini && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.layers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Layers</Text>
          </View>
        )}
      </View>

      {/* Diagram */}
      <ScrollView
        style={styles.diagramContainer}
        contentContainerStyle={styles.diagramContent}
        horizontal={orientation === 'horizontal'}
        showsHorizontalScrollIndicator={!isMini}
        showsVerticalScrollIndicator={!isMini}
      >
        <View style={[styles.svgContainer, { backgroundColor: colors.background }]}>
          <Svg width={diagramWidth} height={diagramHeight}>
            {/* Render links first (behind nodes) */}
            {layout.links.map((link) => renderLink(link))}

            {/* Render nodes */}
            {layout.nodes.map((node, index) => renderNode(node, index))}
          </Svg>
        </View>
      </ScrollView>

      {/* Legend */}
      {!isMini && (
        <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Key Nodes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.legendItems}>
              {data.nodes.slice(0, 6).map((node, index) => (
                <View key={node.id} style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: getNodeColor(node, index) }]}
                  />
                  <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                    {node.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
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
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 12,
    maxWidth: 100,
  },
});
