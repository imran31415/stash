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
import type {
  NetworkTopologyDetailViewProps,
  NetworkNode,
  NetworkConnection,
} from './NetworkTopology.types';
import { NetworkTopology } from './NetworkTopology';
import {
  calculateNetworkStats,
  getNodeIcon,
  getNodeStatusColor,
  formatBandwidth,
  formatLatency,
} from './NetworkTopology.utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NetworkTopologyDetailView: React.FC<NetworkTopologyDetailViewProps> = ({
  data,
  visible,
  onClose,
  onNodePress,
  onConnectionPress,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'topology' | 'nodes' | 'connections' | 'stats'>('topology');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);

  const stats = useMemo(() => calculateNetworkStats(data), [data]);

  const handleNodePress = (node: NetworkNode) => {
    setSelectedNode(node);
    setSelectedConnection(null);
    onNodePress?.(node);
  };

  const handleConnectionPress = (connection: NetworkConnection) => {
    setSelectedConnection(connection);
    setSelectedNode(null);
    onConnectionPress?.(connection);
  };

  const renderTopologyTab = () => (
    <View style={{ flex: 1 }}>
      <NetworkTopology
        data={data}
        mode="full"
        layout="hierarchical"
        height={500}
        width={SCREEN_WIDTH - 40}
        showLabels={true}
        showStatus={true}
        onNodePress={handleNodePress}
        onConnectionPress={handleConnectionPress}
      />
      {(selectedNode || selectedConnection) && renderSelectionDetails()}
    </View>
  );

  const renderNodesTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
      {data.nodes.map((node, index) => {
        const nodeColor = getNodeStatusColor(node);
        const icon = getNodeIcon(node);

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
              <Text style={styles.nodeIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.nodeItemTitleRow}>
                  <Text style={[styles.nodeItemTitle, { color: colors.text }]}>{node.label}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: nodeColor }]}>
                    <Text style={styles.statusBadgeText}>{node.status || 'unknown'}</Text>
                  </View>
                </View>
                <Text style={[styles.nodeItemType, { color: colors.textSecondary }]}>
                  {node.type || 'custom'}
                </Text>
              </View>
            </View>

            {node.metadata && (
              <View style={styles.nodeMetadata}>
                {node.metadata.ip && (
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                    IP: {node.metadata.ip}
                  </Text>
                )}
                {node.metadata.location && (
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                    📍 {node.metadata.location}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderConnectionsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
      {data.connections.map((connection) => {
        const sourceNode = data.nodes.find((n) => n.id === connection.source);
        const targetNode = data.nodes.find((n) => n.id === connection.target);

        return (
          <TouchableOpacity
            key={connection.id}
            style={[
              styles.connectionItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => handleConnectionPress(connection)}
          >
            <View style={styles.connectionItemHeader}>
              <Text style={[styles.connectionItemTitle, { color: colors.text }]}>
                {sourceNode?.label || connection.source} ↔ {targetNode?.label || connection.target}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      connection.status === 'active'
                        ? '#10B981'
                        : connection.status === 'error'
                        ? '#EF4444'
                        : '#6B7280',
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>{connection.status || 'unknown'}</Text>
              </View>
            </View>

            <View style={styles.connectionMeta}>
              <Text style={[styles.connectionMetaText, { color: colors.textSecondary }]}>
                {connection.type || 'ethernet'}
              </Text>
              {connection.bandwidth !== undefined && (
                <Text style={[styles.connectionMetaText, { color: colors.textSecondary }]}>
                  • {formatBandwidth(connection.bandwidth)}
                </Text>
              )}
              {connection.latency !== undefined && (
                <Text style={[styles.connectionMetaText, { color: colors.textSecondary }]}>
                  • {formatLatency(connection.latency)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Network Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.totalNodes}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Nodes</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.primary }]}>
              {stats.totalConnections}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Connections</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Node Health</Text>
        <View style={styles.statsList}>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>Online</Text>
            <Text style={[styles.statsListValue, { color: '#10B981' }]}>{stats.onlineNodes}</Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>Offline</Text>
            <Text style={[styles.statsListValue, { color: '#6B7280' }]}>{stats.offlineNodes}</Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>Errors</Text>
            <Text style={[styles.statsListValue, { color: '#EF4444' }]}>{stats.errorNodes}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Connection Health</Text>
        <View style={styles.statsList}>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>Active</Text>
            <Text style={[styles.statsListValue, { color: '#10B981' }]}>
              {stats.activeConnections}
            </Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>Inactive</Text>
            <Text style={[styles.statsListValue, { color: '#6B7280' }]}>
              {stats.inactiveConnections}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSelectionDetails = () => {
    if (!selectedNode && !selectedConnection) return null;

    return (
      <View
        style={[styles.detailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <View style={styles.detailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              {selectedNode ? 'Node Details' : 'Connection Details'}
            </Text>
            <Text style={[styles.detailsSubtitle, { color: colors.textSecondary }]}>
              {selectedNode
                ? selectedNode.label
                : `${selectedConnection?.source} ↔ ${selectedConnection?.target}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedNode(null);
              setSelectedConnection(null);
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
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Type</Text>
                <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                  {selectedNode.type || 'custom'}
                </Text>
              </View>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Status</Text>
                <Text
                  style={[
                    styles.detailsSectionText,
                    { color: getNodeStatusColor(selectedNode) },
                  ]}
                >
                  {selectedNode.status || 'unknown'}
                </Text>
              </View>
              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                    Metadata
                  </Text>
                  {Object.entries(selectedNode.metadata).map(([key, value]) => (
                    <Text key={key} style={[styles.metadataDetailText, { color: colors.text }]}>
                      {key}: {String(value)}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}

          {selectedConnection && (
            <>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Type</Text>
                <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                  {selectedConnection.type || 'ethernet'}
                </Text>
              </View>
              {selectedConnection.bandwidth !== undefined && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                    Bandwidth
                  </Text>
                  <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                    {formatBandwidth(selectedConnection.bandwidth)}
                  </Text>
                </View>
              )}
              {selectedConnection.latency !== undefined && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                    Latency
                  </Text>
                  <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                    {formatLatency(selectedConnection.latency)}
                  </Text>
                </View>
              )}
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
          {['topology', 'nodes', 'connections', 'stats'].map((tab) => (
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
          {activeTab === 'topology' && renderTopologyTab()}
          {activeTab === 'nodes' && renderNodesTab()}
          {activeTab === 'connections' && renderConnectionsTab()}
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
    fontSize: 14,
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
    gap: 10,
  },
  nodeItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nodeIcon: {
    fontSize: 24,
  },
  nodeItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nodeItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  nodeItemType: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nodeMetadata: {
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  connectionItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  connectionItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  connectionItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  connectionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  connectionMetaText: {
    fontSize: 12,
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
  metadataDetailText: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
