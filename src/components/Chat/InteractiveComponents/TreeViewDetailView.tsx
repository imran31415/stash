import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { TreeViewDetailViewProps, TreeNode } from './TreeView.types';
import { TreeView } from './TreeView';
import { calculateTreeStats, findNode, formatSize, getInitiallyExpandedNodes } from './TreeView.utils';
import { SearchBar } from './shared';

export const TreeViewDetailView: React.FC<TreeViewDetailViewProps> = ({
  data,
  visible,
  onClose,
  onNodePress,
  onNodeExpand,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'tree' | 'list' | 'stats'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<{ node: TreeNode; path: TreeNode[] } | null>(null);
  const [expandedNodes] = useState<Set<string>>(() => getInitiallyExpandedNodes(data.roots, 2));

  const stats = useMemo(() => calculateTreeStats(data, expandedNodes), [data, expandedNodes]);

  const handleNodePress = useCallback(
    (node: TreeNode, path: TreeNode[]) => {
      setSelectedNode({ node, path });
      onNodePress?.(node, path);
    },
    [onNodePress]
  );

  // Get all nodes in a flat list
  const allNodes = useMemo(() => {
    const nodes: Array<{ node: TreeNode; path: TreeNode[]; depth: number }> = [];
    const traverse = (node: TreeNode, path: TreeNode[], depth: number) => {
      nodes.push({ node, path: [...path, node], depth });
      if (node.children) {
        node.children.forEach((child) => traverse(child, [...path, node], depth + 1));
      }
    };
    data.roots.forEach((root) => traverse(root, [], 0));
    return nodes;
  }, [data]);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return allNodes;
    const query = searchQuery.toLowerCase();
    return allNodes.filter(({ node }) =>
      node.label.toLowerCase().includes(query) ||
      node.metadata?.description?.toLowerCase().includes(query)
    );
  }, [allNodes, searchQuery]);

  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    const { node, path } = selectedNode;

    return (
      <View style={[styles.nodeDetailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.nodeDetailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nodeDetailsTitle, { color: colors.text }]}>{node.label}</Text>
            <Text style={[styles.nodeDetailsPath, { color: colors.textSecondary }]}>
              {path.map((n) => n.label).join(' > ')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedNode(null)} style={styles.closeDetailsButton}>
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.nodeDetailsContent} showsVerticalScrollIndicator={false}>
          {/* Type */}
          {node.type && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Type
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {node.type}
              </Text>
            </View>
          )}

          {/* Description */}
          {node.metadata?.description && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {node.metadata.description}
              </Text>
            </View>
          )}

          {/* Size */}
          {node.metadata?.size && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Size
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {formatSize(node.metadata.size)}
              </Text>
            </View>
          )}

          {/* Modified */}
          {node.metadata?.modified && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Modified
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {new Date(node.metadata.modified).toLocaleString()}
              </Text>
            </View>
          )}

          {/* Count */}
          {node.metadata?.count !== undefined && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Items
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {node.metadata.count}
              </Text>
            </View>
          )}

          {/* Children */}
          {node.children && node.children.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Children ({node.children.length})
              </Text>
              <View style={styles.childrenList}>
                {node.children.map((child) => (
                  <View key={child.id} style={[styles.childItem, { borderColor: colors.border }]}>
                    <Text style={[styles.childLabel, { color: colors.text }]}>{child.label}</Text>
                    {child.metadata?.count !== undefined && (
                      <Text style={[styles.childCount, { color: colors.textSecondary }]}>
                        ({child.metadata.count})
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderTreeTab = () => (
    <View style={{ flex: 1 }}>
      <TreeView
        data={data}
        mode="full"
        showIcons={true}
        showLines={true}
        onNodePress={handleNodePress}
        onNodeExpand={onNodeExpand}
      />
      {selectedNode && renderNodeDetails()}
    </View>
  );

  const renderListTab = () => (
    <View style={{ flex: 1 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search nodes..."
      />

      {/* Nodes list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.nodesListContent}>
        {filteredNodes.map(({ node, path, depth }) => (
          <TouchableOpacity
            key={node.id}
            style={[
              styles.nodeListItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => handleNodePress(node, path)}
          >
            <View style={styles.nodeListHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.nodeListTitle, { color: colors.text }]}>
                  {'  '.repeat(depth)}
                  {node.label}
                </Text>
                {node.metadata?.description && (
                  <Text style={[styles.nodeListDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                    {node.metadata.description}
                  </Text>
                )}
              </View>
              {node.badge && (
                <View style={[styles.nodeListBadge, { backgroundColor: node.color || colors.primary }]}>
                  <Text style={styles.nodeListBadgeText}>{node.badge}</Text>
                </View>
              )}
            </View>
            <View style={styles.nodeListMeta}>
              {node.type && (
                <Text style={[styles.nodeListMetaText, { color: colors.textSecondary }]}>
                  {node.type}
                </Text>
              )}
              {node.metadata?.size && (
                <Text style={[styles.nodeListMetaText, { color: colors.textSecondary }]}>
                  • {formatSize(node.metadata.size)}
                </Text>
              )}
              {node.metadata?.count !== undefined && (
                <Text style={[styles.nodeListMetaText, { color: colors.textSecondary }]}>
                  • {node.metadata.count} items
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      {/* Overview */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.totalNodes}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total Nodes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.visibleNodes}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Visible</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.leafNodes}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Leaf Nodes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.maxDepth}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Max Depth</Text>
          </View>
        </View>
      </View>

      {/* Distribution by Type */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Node Types</Text>
        {(() => {
          const typeCount: Record<string, number> = {};
          allNodes.forEach(({ node }) => {
            const type = node.type || 'unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
          return Object.entries(typeCount).map(([type, count]) => (
            <View key={type} style={styles.typeStat}>
              <View style={styles.typeStatHeader}>
                <Text style={[styles.typeStatTitle, { color: colors.text }]}>{type}</Text>
                <Text style={[styles.typeStatCount, { color: colors.textSecondary }]}>
                  {count} nodes
                </Text>
              </View>
              <View style={[styles.typeStatBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.typeStatFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${(count / stats.totalNodes) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ));
        })()}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tree' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('tree')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'tree' ? colors.primary : colors.textSecondary }]}>
              🌳 Tree
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('list')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'list' ? colors.primary : colors.textSecondary }]}>
              📝 List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'stats' ? colors.primary : colors.textSecondary }]}>
              📊 Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'tree' && renderTreeTab()}
        {activeTab === 'list' && renderListTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nodeDetailsPanel: {
    borderTopWidth: 1,
    maxHeight: '50%',
  },
  nodeDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  nodeDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  nodeDetailsPath: {
    fontSize: 12,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  nodeDetailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailsSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  childrenList: {
    gap: 8,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  childLabel: {
    fontSize: 13,
    flex: 1,
  },
  childCount: {
    fontSize: 12,
  },
  nodesListContent: {
    padding: 16,
    gap: 12,
  },
  nodeListItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  nodeListHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nodeListTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  nodeListDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  nodeListBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 12,
  },
  nodeListBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nodeListMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodeListMetaText: {
    fontSize: 12,
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsSection: {
    padding: 16,
    borderRadius: 12,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  typeStat: {
    marginBottom: 16,
  },
  typeStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeStatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeStatCount: {
    fontSize: 13,
  },
  typeStatBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  typeStatFill: {
    height: '100%',
  },
});
