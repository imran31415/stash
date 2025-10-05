import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { TreeViewProps, TreeNode } from './TreeView.types';
import {
  calculateTreeStats,
  getDefaultIcon,
  getInitiallyExpandedNodes,
  formatSize,
} from './TreeView.utils';
import {
  borderRadius,
  shadows,
  useThemeColors,
  useResponsiveMode,
  ComponentHeader,
  StatsBar,
} from './shared';

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  mode = 'mini',
  layout = 'vertical',
  height = 400,
  width,
  showIcons = true,
  showLines = true,
  initialExpandedDepth = 1,
  onNodePress,
  onNodeExpand,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const { isMini } = useResponsiveMode(mode);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() =>
    getInitiallyExpandedNodes(data.roots, initialExpandedDepth)
  );

  const stats = useMemo(() => calculateTreeStats(data, expandedNodes), [data, expandedNodes]);

  const toggleNode = useCallback(
    (node: TreeNode) => {
      if (!node.children || node.children.length === 0) return;

      setExpandedNodes((prev) => {
        const next = new Set(prev);
        const isExpanded = next.has(node.id);
        if (isExpanded) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        onNodeExpand?.(node, !isExpanded);
        return next;
      });
    },
    [onNodeExpand]
  );

  const handleNodePress = useCallback(
    (node: TreeNode, path: TreeNode[]) => {
      if (node.children && node.children.length > 0) {
        toggleNode(node);
      }
      onNodePress?.(node, path);
    },
    [toggleNode, onNodePress]
  );

  const renderNode = (node: TreeNode, depth: number, path: TreeNode[], isLastChild: boolean, parentLines: boolean[]) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id) || node.expanded;
    const icon = showIcons ? getDefaultIcon({ ...node, expanded: isExpanded }) : null;
    const isDisabled = node.status === 'disabled';
    const isSelected = node.status === 'selected';
    const isHighlighted = node.status === 'highlighted';

    return (
      <View key={node.id} style={styles.nodeContainer}>
        <TouchableOpacity
          style={[
            styles.nodeRow,
            isSelected && { backgroundColor: colors.primary + '20' },
            isHighlighted && { backgroundColor: '#FEF3C7' },
          ]}
          onPress={() => !isDisabled && handleNodePress(node, [...path, node])}
          disabled={isDisabled}
          activeOpacity={0.7}
          accessibilityRole={hasChildren ? "button" : "text"}
          accessibilityLabel={`${node.label}${hasChildren ? `, ${node.children!.length} item${node.children!.length !== 1 ? 's' : ''}` : ''}${isSelected ? ', selected' : ''}${isDisabled ? ', disabled' : ''}`}
          accessibilityHint={hasChildren ? `Double tap to ${isExpanded ? 'collapse' : 'expand'}` : undefined}
          accessibilityState={{
            expanded: hasChildren ? isExpanded : undefined,
            disabled: isDisabled,
            selected: isSelected,
          }}
        >
          {/* Indent lines */}
          {showLines && depth > 0 && (
            <View style={styles.indentContainer}>
              {parentLines.map((hasLine, idx) => (
                <View key={idx} style={styles.indentLevel}>
                  {hasLine && (
                    <View
                      style={[
                        styles.verticalLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                </View>
              ))}
              <View style={styles.indentLevel}>
                {!isLastChild && (
                  <View
                    style={[
                      styles.verticalLine,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.horizontalLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Indent spacing without lines */}
          {!showLines && depth > 0 && (
            <View style={[styles.indent, { width: depth * 20 }]} />
          )}

          {/* Expand/collapse icon */}
          {hasChildren && (
            <View style={styles.expandIcon}>
              <Text style={[styles.expandIconText, { color: colors.textSecondary }]}>
                {isExpanded ? '▼' : '▶'}
              </Text>
            </View>
          )}
          {!hasChildren && showIcons && <View style={styles.expandIcon} />}

          {/* Node icon */}
          {icon && <Text style={styles.nodeIcon}>{icon}</Text>}

          {/* Node label */}
          <Text
            style={[
              styles.nodeLabel,
              { color: isDisabled ? colors.textTertiary : colors.text },
              isSelected && { fontWeight: '700' },
            ]}
            numberOfLines={isMini ? 1 : 2}
          >
            {node.label}
          </Text>

          {/* Badge */}
          {node.badge && (
            <View style={[styles.badge, { backgroundColor: node.color || colors.primary }]}>
              <Text style={styles.badgeText}>{node.badge}</Text>
            </View>
          )}

          {/* Metadata */}
          {!isMini && node.metadata?.size && (
            <Text style={[styles.metadata, { color: colors.textSecondary }]}>
              {formatSize(node.metadata.size)}
            </Text>
          )}
          {!isMini && node.metadata?.count !== undefined && (
            <Text style={[styles.metadata, { color: colors.textSecondary }]}>
              ({node.metadata.count})
            </Text>
          )}
        </TouchableOpacity>

        {/* Children */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {node.children!.map((child, index) =>
              renderNode(
                child,
                depth + 1,
                [...path, node],
                index === node.children!.length - 1,
                [...parentLines, !isLastChild]
              )
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isMini && styles.containerMini,
      { height, backgroundColor: colors.surface }
    ]}>
      <ComponentHeader
        title={data.title}
        description={data.description}
        isMini={isMini}
        onExpandPress={onExpandPress}
      />

      <StatsBar
        stats={[
          { value: stats.totalNodes, label: 'Total' },
          { value: stats.visibleNodes, label: 'Visible' },
          { value: stats.expandedNodes, label: 'Expanded' },
          { value: stats.maxDepth, label: 'Depth' },
        ]}
      />

      {/* Tree */}
      <ScrollView
        style={styles.treeContainer}
        contentContainerStyle={styles.treeContent}
        showsVerticalScrollIndicator={true}
      >
        {data.roots.map((root, index) =>
          renderNode(root, 0, [], index === data.roots.length - 1, [])
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerMini: {
    borderRadius: borderRadius.md,
  },
  treeContainer: {
    flex: 1,
  },
  treeContent: {
    padding: 12,
  },
  nodeContainer: {
    marginBottom: 2,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    minHeight: 36,
  },
  indentContainer: {
    flexDirection: 'row',
  },
  indentLevel: {
    width: 20,
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 9,
    top: 0,
    bottom: 0,
    width: 1,
  },
  horizontalLine: {
    position: 'absolute',
    left: 9,
    top: 18,
    width: 11,
    height: 1,
  },
  indent: {
    height: 1,
  },
  expandIcon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  expandIconText: {
    fontSize: 10,
  },
  nodeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  nodeLabel: {
    fontSize: 14,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metadata: {
    fontSize: 12,
    marginLeft: 8,
  },
  childrenContainer: {
    marginLeft: 0,
  },
});
