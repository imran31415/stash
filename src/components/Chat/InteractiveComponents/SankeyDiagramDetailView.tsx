import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { SankeyDiagramDetailViewProps, SankeyNode, SankeyLink } from './SankeyDiagram.types';
import { SankeyDiagram } from './SankeyDiagram';
import {
  calculateSankeyStats,
  getNodeColor,
  formatNumber,
  formatPercentage,
} from './SankeyDiagram.utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SankeyDiagramDetailView: React.FC<SankeyDiagramDetailViewProps> = ({
  data,
  visible,
  onClose,
  onNodePress,
  onLinkPress,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'diagram' | 'nodes' | 'links' | 'stats'>('diagram');
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<SankeyLink | null>(null);

  const stats = useMemo(() => calculateSankeyStats(data), [data]);

  const handleNodePress = (node: SankeyNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
    onNodePress?.(node);
  };

  const handleLinkPress = (link: SankeyLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
    onLinkPress?.(link);
  };

  const renderDiagramTab = () => (
    <View style={{ flex: 1 }}>
      <SankeyDiagram
        data={data}
        mode="full"
        orientation="horizontal"
        height={500}
        width={SCREEN_WIDTH - 40}
        showValues={true}
        showLabels={true}
        onNodePress={handleNodePress}
        onLinkPress={handleLinkPress}
      />
      {(selectedNode || selectedLink) && renderSelectionDetails()}
    </View>
  );

  const renderNodesTab = () => {
    const nodeIncoming = new Map<string, number>();
    const nodeOutgoing = new Map<string, number>();

    data.links.forEach((link) => {
      nodeOutgoing.set(link.source, (nodeOutgoing.get(link.source) || 0) + link.value);
      nodeIncoming.set(link.target, (nodeIncoming.get(link.target) || 0) + link.value);
    });

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {data.nodes.map((node, index) => {
          const incoming = nodeIncoming.get(node.id) || 0;
          const outgoing = nodeOutgoing.get(node.id) || 0;
          const total = Math.max(incoming, outgoing);

          return (
            <TouchableOpacity
              key={node.id}
              style={[
                styles.nodeItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => handleNodePress(node)}
            >
              <View style={styles.nodeItemHeader}>
                <View
                  style={[styles.nodeColorIndicator, { backgroundColor: getNodeColor(node, index) }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nodeItemTitle, { color: colors.text }]}>{node.label}</Text>
                  {node.metadata?.description && (
                    <Text style={[styles.nodeItemDescription, { color: colors.textSecondary }]}>
                      {node.metadata.description}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.nodeItemStats}>
                <View style={styles.nodeItemStat}>
                  <Text style={[styles.nodeItemStatLabel, { color: colors.textSecondary }]}>
                    Incoming
                  </Text>
                  <Text style={[styles.nodeItemStatValue, { color: '#10B981' }]}>
                    {formatNumber(incoming)}
                  </Text>
                </View>
                <View style={styles.nodeItemStat}>
                  <Text style={[styles.nodeItemStatLabel, { color: colors.textSecondary }]}>
                    Outgoing
                  </Text>
                  <Text style={[styles.nodeItemStatValue, { color: '#3B82F6' }]}>
                    {formatNumber(outgoing)}
                  </Text>
                </View>
                <View style={styles.nodeItemStat}>
                  <Text style={[styles.nodeItemStatLabel, { color: colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.nodeItemStatValue, { color: colors.text }]}>
                    {formatNumber(total)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderLinksTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
      {data.links.map((link) => {
        const sourceNode = data.nodes.find((n) => n.id === link.source);
        const targetNode = data.nodes.find((n) => n.id === link.target);

        return (
          <TouchableOpacity
            key={link.id}
            style={[
              styles.linkItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => handleLinkPress(link)}
          >
            <View style={styles.linkItemHeader}>
              <Text style={[styles.linkItemTitle, { color: colors.text }]}>
                {sourceNode?.label || link.source} → {targetNode?.label || link.target}
              </Text>
              {link.label && (
                <Text style={[styles.linkItemLabel, { color: colors.textSecondary }]}>
                  {link.label}
                </Text>
              )}
            </View>
            <View style={styles.linkItemValue}>
              <Text style={[styles.linkItemValueText, { color: colors.primary }]}>
                {formatNumber(link.value)}
              </Text>
              <Text style={[styles.linkItemPercentage, { color: colors.textSecondary }]}>
                {formatPercentage(link.value, stats.totalFlow)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Diagram Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.totalNodes}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Nodes</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.primary }]}>{stats.totalLinks}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Links</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: '#10B981' }]}>
              {formatNumber(stats.totalFlow)}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Total Flow</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.layers}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Layers</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Flow Distribution</Text>
        <View style={styles.statsList}>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Max Node Value
            </Text>
            <Text style={[styles.statsListValue, { color: colors.text }]}>
              {formatNumber(stats.maxNodeValue)}
            </Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Max Link Value
            </Text>
            <Text style={[styles.statsListValue, { color: colors.text }]}>
              {formatNumber(stats.maxLinkValue)}
            </Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Average Link Value
            </Text>
            <Text style={[styles.statsListValue, { color: colors.text }]}>
              {formatNumber(Math.round(stats.totalFlow / stats.totalLinks))}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSelectionDetails = () => {
    if (!selectedNode && !selectedLink) return null;

    return (
      <View
        style={[styles.detailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <View style={styles.detailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              {selectedNode ? 'Node Details' : 'Link Details'}
            </Text>
            <Text style={[styles.detailsSubtitle, { color: colors.textSecondary }]}>
              {selectedNode ? selectedNode.label : `${selectedLink?.source} → ${selectedLink?.target}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedNode(null);
              setSelectedLink(null);
            }}
            style={styles.closeDetailsButton}
          >
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
          {selectedNode && (
            <>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                  Node ID
                </Text>
                <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                  {selectedNode.id}
                </Text>
              </View>
              {selectedNode.value !== undefined && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                    Value
                  </Text>
                  <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                    {formatNumber(selectedNode.value)}
                  </Text>
                </View>
              )}
            </>
          )}

          {selectedLink && (
            <>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Value</Text>
                <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                  {formatNumber(selectedLink.value)}
                </Text>
              </View>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                  Percentage
                </Text>
                <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                  {formatPercentage(selectedLink.value, stats.totalFlow)}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {['diagram', 'nodes', 'links', 'stats'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === 'diagram' && renderDiagramTab()}
          {activeTab === 'nodes' && renderNodesTab()}
          {activeTab === 'links' && renderLinksTab()}
          {activeTab === 'stats' && renderStatsTab()}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  nodeItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  nodeItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nodeColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  nodeItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  nodeItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  nodeItemStats: {
    flexDirection: 'row',
    gap: 16,
  },
  nodeItemStat: {
    flex: 1,
  },
  nodeItemStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  nodeItemStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  linkItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  linkItemHeader: {
    gap: 4,
  },
  linkItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkItemLabel: {
    fontSize: 12,
  },
  linkItemValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  linkItemValueText: {
    fontSize: 20,
    fontWeight: '700',
  },
  linkItemPercentage: {
    fontSize: 14,
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statsGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsGridValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsGridLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statsList: {
    gap: 12,
  },
  statsListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsListLabel: {
    fontSize: 14,
  },
  statsListValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  detailsContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailsSectionText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
