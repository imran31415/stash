import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import type { WorkflowDetailViewProps, WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowNodeStatus } from './Workflow.types';
import { Workflow } from './Workflow';
import {
  calculateWorkflowStats,
  getNodeIcon,
  formatDuration,
  formatTimestamp,
} from './Workflow.utils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const WorkflowDetailView: React.FC<WorkflowDetailViewProps> = ({
  visible,
  data,
  title,
  subtitle,
  onClose,
  onNodePress,
  onEdgePress,
  showLabels = true,
  showEdgeLabels = true,
  showStatus = true,
  showMetadata = true,
  orientation = 'horizontal',
  enableLiveUpdates = false,
  animateExecution = false,
  highlightCriticalPath = false,
  searchable = true,
  filterByType,
  filterByStatus,
}) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'workflow' | 'details' | 'stats'>('workflow');

  const stats = useMemo(() => calculateWorkflowStats(data), [data]);

  // Filter workflow data based on search and filters
  const filteredData = useMemo(() => {
    let nodes = data.nodes;
    let edges = data.edges;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.description?.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
      );

      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    }

    // Apply type filter
    if (filterByType && filterByType.length > 0) {
      nodes = nodes.filter((node) => filterByType.includes(node.type));
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    }

    // Apply status filter
    if (filterByStatus && filterByStatus.length > 0) {
      nodes = nodes.filter((node) => node.status && filterByStatus.includes(node.status));
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    }

    return {
      ...data,
      nodes,
      edges,
    };
  }, [data, searchQuery, filterByType, filterByStatus]);

  const handleNodePress = useCallback(
    (node: WorkflowNode) => {
      setSelectedNode(node);
      setSelectedEdge(null);
      // Keep on workflow tab - don't switch
      onNodePress?.(node);
    },
    [onNodePress]
  );

  const handleEdgePress = useCallback(
    (edge: WorkflowEdge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
      // Keep on workflow tab - don't switch
      onEdgePress?.(edge);
    },
    [onEdgePress]
  );

  const renderWorkflowTab = () => (
    <View style={styles.tabContent}>
      {searchable && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search nodes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.workflowScrollView}>
        <View style={styles.workflowContainer}>
          <Workflow
            data={filteredData}
            mode="full"
            title={title}
            subtitle={subtitle}
            onNodePress={handleNodePress}
            onEdgePress={handleEdgePress}
            showLabels={showLabels}
            showEdgeLabels={showEdgeLabels}
            showStatus={showStatus}
            showMetadata={false}
            orientation={orientation}
            enableLiveUpdates={enableLiveUpdates}
            animateExecution={animateExecution}
            highlightCriticalPath={highlightCriticalPath}
            width={SCREEN_WIDTH - 32}
            height={SCREEN_HEIGHT - 400}
          />
        </View>

        {/* Node/Edge Details Panel - shown below workflow */}
        {(selectedNode || selectedEdge) && (
          <View style={styles.inlineDetailsPanel}>
            {selectedNode && (
              <View style={styles.detailsSection}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsIcon}>{getNodeIcon(selectedNode)}</Text>
                  <View style={styles.detailsHeaderText}>
                    <Text style={styles.detailsTitle}>{selectedNode.label}</Text>
                    <Text style={styles.detailsSubtitle}>{selectedNode.type}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeDetailsButton}
                    onPress={() => setSelectedNode(null)}
                  >
                    <Text style={styles.closeDetailsText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedNode.description && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Description</Text>
                    <Text style={styles.detailsValue}>{selectedNode.description}</Text>
                  </View>
                )}

                {selectedNode.status && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Status</Text>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusIndicator,
                          {
                            backgroundColor:
                              selectedNode.status === 'running'
                                ? '#60A5FA'
                                : selectedNode.status === 'success'
                                ? '#34D399'
                                : selectedNode.status === 'failed'
                                ? '#F87171'
                                : '#9CA3AF',
                          },
                        ]}
                      />
                      <Text style={styles.statusText}>{selectedNode.status}</Text>
                    </View>
                  </View>
                )}

                {selectedNode.metadata && (
                  <>
                    {selectedNode.metadata.duration !== undefined && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Duration</Text>
                        <Text style={styles.detailsValue}>
                          {formatDuration(selectedNode.metadata.duration)}
                        </Text>
                      </View>
                    )}

                    {selectedNode.metadata.retries !== undefined && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Retries</Text>
                        <Text style={styles.detailsValue}>{selectedNode.metadata.retries}</Text>
                      </View>
                    )}

                    {selectedNode.metadata.error && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Error</Text>
                        <Text style={[styles.detailsValue, styles.errorText]}>
                          {selectedNode.metadata.error}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {selectedEdge && (
              <View style={styles.detailsSection}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>Edge Details</Text>
                  <TouchableOpacity
                    style={styles.closeDetailsButton}
                    onPress={() => setSelectedEdge(null)}
                  >
                    <Text style={styles.closeDetailsText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Source</Text>
                  <Text style={styles.detailsValue}>{selectedEdge.source}</Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Target</Text>
                  <Text style={styles.detailsValue}>{selectedEdge.target}</Text>
                </View>

                {selectedEdge.label && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Label</Text>
                    <Text style={styles.detailsValue}>{selectedEdge.label}</Text>
                  </View>
                )}

                {selectedEdge.conditionType && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Condition Type</Text>
                    <Text style={styles.detailsValue}>{selectedEdge.conditionType}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderDetailsTab = () => {
    if (selectedNode) {
      return (
        <ScrollView style={styles.tabContent}>
          <View style={styles.detailsSection}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsIcon}>{getNodeIcon(selectedNode)}</Text>
              <View style={styles.detailsHeaderText}>
                <Text style={styles.detailsTitle}>{selectedNode.label}</Text>
                <Text style={styles.detailsSubtitle}>{selectedNode.type}</Text>
              </View>
            </View>

            {selectedNode.description && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Description</Text>
                <Text style={styles.detailsValue}>{selectedNode.description}</Text>
              </View>
            )}

            {selectedNode.status && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor:
                          selectedNode.status === 'running'
                            ? '#60A5FA'
                            : selectedNode.status === 'success'
                            ? '#34D399'
                            : selectedNode.status === 'failed'
                            ? '#F87171'
                            : '#9CA3AF',
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>{selectedNode.status}</Text>
                </View>
              </View>
            )}

            {selectedNode.metadata && (
              <>
                <Text style={styles.sectionTitle}>Execution Details</Text>

                {selectedNode.metadata.startTime && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Start Time</Text>
                    <Text style={styles.detailsValue}>
                      {formatTimestamp(selectedNode.metadata.startTime)}
                    </Text>
                  </View>
                )}

                {selectedNode.metadata.endTime && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>End Time</Text>
                    <Text style={styles.detailsValue}>
                      {formatTimestamp(selectedNode.metadata.endTime)}
                    </Text>
                  </View>
                )}

                {selectedNode.metadata.duration !== undefined && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Duration</Text>
                    <Text style={styles.detailsValue}>
                      {formatDuration(selectedNode.metadata.duration)}
                    </Text>
                  </View>
                )}

                {selectedNode.metadata.retries !== undefined && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Retries</Text>
                    <Text style={styles.detailsValue}>{selectedNode.metadata.retries}</Text>
                  </View>
                )}

                {selectedNode.metadata.error && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Error</Text>
                    <Text style={[styles.detailsValue, styles.errorText]}>
                      {selectedNode.metadata.error}
                    </Text>
                  </View>
                )}

                {selectedNode.metadata.logs && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Logs</Text>
                    <View style={styles.logsContainer}>
                      <Text style={styles.logsText}>{selectedNode.metadata.logs}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      );
    }

    if (selectedEdge) {
      return (
        <ScrollView style={styles.tabContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Edge Details</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Source</Text>
              <Text style={styles.detailsValue}>{selectedEdge.source}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Target</Text>
              <Text style={styles.detailsValue}>{selectedEdge.target}</Text>
            </View>

            {selectedEdge.label && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Label</Text>
                <Text style={styles.detailsValue}>{selectedEdge.label}</Text>
              </View>
            )}

            {selectedEdge.condition && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Condition</Text>
                <Text style={styles.detailsValue}>{selectedEdge.condition}</Text>
              </View>
            )}

            {selectedEdge.conditionType && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Type</Text>
                <Text style={styles.detailsValue}>{selectedEdge.conditionType}</Text>
              </View>
            )}

            {selectedEdge.metadata && (
              <>
                <Text style={styles.sectionTitle}>Execution Details</Text>

                {selectedEdge.metadata.executionCount !== undefined && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Execution Count</Text>
                    <Text style={styles.detailsValue}>
                      {selectedEdge.metadata.executionCount}
                    </Text>
                  </View>
                )}

                {selectedEdge.metadata.lastExecuted && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Last Executed</Text>
                    <Text style={styles.detailsValue}>
                      {formatTimestamp(selectedEdge.metadata.lastExecuted)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.emptyDetails}>
        <Text style={styles.emptyDetailsText}>Select a node or edge to view details</Text>
      </View>
    );
  };

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Workflow Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{stats.totalNodes}</Text>
            <Text style={styles.statCardLabel}>Total Nodes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{stats.totalEdges}</Text>
            <Text style={styles.statCardLabel}>Total Edges</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{stats.layers}</Text>
            <Text style={styles.statCardLabel}>Layers</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{stats.longestPath}</Text>
            <Text style={styles.statCardLabel}>Longest Path</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Nodes by Type</Text>
        {Object.entries(stats.nodesByType)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => (
            <View key={type} style={styles.statsRow}>
              <Text style={styles.statsLabel}>{type}</Text>
              <Text style={styles.statsValue}>{count}</Text>
            </View>
          ))}

        <Text style={styles.sectionTitle}>Nodes by Status</Text>
        {Object.entries(stats.nodesByStatus)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => (
            <View key={status} style={styles.statsRow}>
              <Text style={styles.statsLabel}>{status}</Text>
              <Text style={styles.statsValue}>{count}</Text>
            </View>
          ))}

        {data.metadata && (
          <>
            <Text style={styles.sectionTitle}>Workflow Metadata</Text>

            {data.metadata.version && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Version</Text>
                <Text style={styles.detailsValue}>{data.metadata.version}</Text>
              </View>
            )}

            {data.metadata.author && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Author</Text>
                <Text style={styles.detailsValue}>{data.metadata.author}</Text>
              </View>
            )}

            {data.metadata.created && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Created</Text>
                <Text style={styles.detailsValue}>
                  {formatTimestamp(data.metadata.created)}
                </Text>
              </View>
            )}

            {data.metadata.executionCount !== undefined && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Total Executions</Text>
                <Text style={styles.detailsValue}>{data.metadata.executionCount}</Text>
              </View>
            )}

            {data.metadata.averageDuration !== undefined && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Avg Duration</Text>
                <Text style={styles.detailsValue}>
                  {formatDuration(data.metadata.averageDuration)}
                </Text>
              </View>
            )}

            {data.metadata.successRate !== undefined && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Success Rate</Text>
                <Text style={styles.detailsValue}>
                  {(data.metadata.successRate * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{data.name}</Text>
            {data.description && (
              <Text style={styles.headerSubtitle}>{data.description}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workflow' && styles.tabActive]}
            onPress={() => setActiveTab('workflow')}
          >
            <Text style={[styles.tabText, activeTab === 'workflow' && styles.tabTextActive]}>
              Workflow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'workflow' && renderWorkflowTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </View>
    </Modal>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
    }),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  searchClear: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  workflowScrollView: {
    flex: 1,
  },
  workflowContainer: {
    paddingHorizontal: 16,
  },
  inlineDetailsPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  detailsSection: {
    padding: 16,
  },
  closeDetailsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  closeDetailsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  detailsRow: {
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  logsContainer: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  logsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 12,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsLabel: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDetailsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
