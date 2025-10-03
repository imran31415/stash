import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Message, ChatTheme } from './types';
import {
  TaskList,
  ResourceList,
  GanttChart,
  GanttChartDetailView,
  TaskDetailBottomSheet,
  TaskListDetailView,
  TimeSeriesChart,
  TimeSeriesChartDetailView,
  GraphVisualization,
  GraphVisualizationDetailView,
  CodeBlock,
  CodeBlockDetailView,
  Media,
  MediaDetailView,
  Dashboard,
  DashboardDetailView,
  DashboardPreview,
  DataTable,
  DataTableDetailView,
} from './InteractiveComponents';
import type { Task, TimeSeriesSeries, GraphData, SupportedLanguage, MediaItem, DashboardConfig, ColumnDefinition, RowData } from './InteractiveComponents';
import { MarkdownText } from './MarkdownText';

export interface ChatMessageProps {
  message: Message;
  theme?: ChatTheme;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isLoading?: boolean;
  onLongPress?: (message: Message) => void;
  onPress?: (message: Message) => void;
  onAvatarPress?: (userId: string) => void;
  presentationMode?: boolean;
  onEnterPresentation?: (message: Message) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  theme,
  showAvatar = true,
  showTimestamp = true,
  isLoading = false,
  onLongPress,
  onPress,
  onAvatarPress,
  presentationMode = false,
  onEnterPresentation,
}) => {
  const isOwn = message?.isOwn ?? false;
  const isSystem = message?.type === 'system';

  // Check if message type should use full width in presentation mode
  const shouldUseFullWidth = presentationMode && (
    message?.type === 'image' ||
    (message?.interactiveComponent &&
      ['gantt-chart', 'task-list', 'time-series-chart', 'graph-visualization', 'code-block', 'media', 'dashboard', 'data-table'].includes(
        message.interactiveComponent.type
      ))
  );

  // State for interactive modals
  const [showGanttDetail, setShowGanttDetail] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTaskListDetail, setShowTaskListDetail] = useState(false);
  const [showTimeSeriesDetail, setShowTimeSeriesDetail] = useState(false);
  const [showGraphDetail, setShowGraphDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [ganttData, setGanttData] = useState<{ tasks: Task[]; title?: string; subtitle?: string } | null>(null);
  const [taskListData, setTaskListData] = useState<{ tasks: Task[]; title?: string; subtitle?: string } | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<{
    series: TimeSeriesSeries[];
    title?: string;
    subtitle?: string;
    pageSize?: number;
    totalDataPoints?: number;
    xAxisLabel?: string;
    yAxisLabel?: string;
  } | null>(null);
  const [graphData, setGraphData] = useState<{
    data: GraphData;
    title?: string;
    subtitle?: string;
  } | null>(null);
  const [showCodeBlockDetail, setShowCodeBlockDetail] = useState(false);
  const [codeBlockData, setCodeBlockData] = useState<{
    code: string;
    language?: SupportedLanguage;
    fileName?: string;
    title?: string;
  } | null>(null);
  const [showMediaDetail, setShowMediaDetail] = useState(false);
  const [mediaData, setMediaData] = useState<MediaItem | MediaItem[] | null>(null);
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [showDataTableDetail, setShowDataTableDetail] = useState(false);
  const [dataTableData, setDataTableData] = useState<{
    columns: ColumnDefinition[];
    data: RowData[];
    title?: string;
    subtitle?: string;
  } | null>(null);

  // Loading state for AI messages
  if (isLoading) {
    return (
      <View style={[styles.container, styles.otherContainer]}>
        {showAvatar && (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: '#007AFF' }]}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        )}
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, { backgroundColor: '#E5E5EA' }]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        </View>
      </View>
    );
  }

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{message.content}</Text>
      </View>
    );
  }

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleGanttExpand = (tasks: Task[], title?: string, subtitle?: string) => {
    setGanttData({ tasks, title, subtitle });
    setShowGanttDetail(true);
  };

  const handleTaskListExpand = (tasks: Task[], title?: string, subtitle?: string) => {
    setTaskListData({ tasks, title, subtitle });
    setShowTaskListDetail(true);
  };

  const handleTimeSeriesExpand = (
    series: TimeSeriesSeries[],
    title?: string,
    subtitle?: string,
    pageSize?: number,
    totalDataPoints?: number,
    xAxisLabel?: string,
    yAxisLabel?: string
  ) => {
    setTimeSeriesData({ series, title, subtitle, pageSize, totalDataPoints, xAxisLabel, yAxisLabel });
    setShowTimeSeriesDetail(true);
  };

  const handleGraphExpand = (data: GraphData, title?: string, subtitle?: string) => {
    setGraphData({ data, title, subtitle });
    setShowGraphDetail(true);
  };

  const handleCodeBlockExpand = (
    code: string,
    language?: SupportedLanguage,
    fileName?: string,
    title?: string
  ) => {
    setCodeBlockData({ code, language, fileName, title });
    setShowCodeBlockDetail(true);
  };

  const handleMediaExpand = (media: MediaItem | MediaItem[]) => {
    setMediaData(media);
    setShowMediaDetail(true);
  };

  const handleDashboardExpand = (config: DashboardConfig) => {
    setDashboardConfig(config);
    setShowDashboardDetail(true);
  };

  const handleDataTableExpand = (
    columns: ColumnDefinition[],
    data: RowData[],
    title?: string,
    subtitle?: string
  ) => {
    setDataTableData({ columns, data, title, subtitle });
    setShowDataTableDetail(true);
  };

  const renderInteractiveComponent = () => {
    if (!message.interactiveComponent) return null;

    const { type, data, onAction } = message.interactiveComponent;
    console.log('[ChatMessage] Rendering interactive component:', type, data);

    switch (type) {
      case 'task-list':
        // Use allTasks if provided (for large datasets), otherwise use tasks
        const tasksForDetailView = data.allTasks || data.tasks;
        return (
          <Pressable onPress={() => handleTaskListExpand(tasksForDetailView, data.title, data.subtitle)}>
            <TaskList
              {...data}
              showExpandButton={true}
              onTaskPress={(task) => {
                handleTaskPress(task);
                onAction?.('task-press', task);
              }}
              onExpandPress={() => handleTaskListExpand(tasksForDetailView, data.title, data.subtitle)}
            />
          </Pressable>
        );
      case 'resource-list':
        return (
          <ResourceList
            {...data}
            onResourcePress={(resource) => onAction?.('resource-press', resource)}
          />
        );
      case 'gantt-chart':
        // Use allTasks if provided (for large datasets), otherwise use tasks
        const ganttTasksForDetailView = data.allTasks || data.tasks;
        return (
          <Pressable onPress={() => handleGanttExpand(ganttTasksForDetailView, data.title, data.subtitle)}>
            <GanttChart
              {...data}
              onTaskPress={(task) => {
                handleTaskPress(task);
                onAction?.('task-press', task);
              }}
              onMilestonePress={(milestone, task) => onAction?.('milestone-press', { milestone, task })}
              onExpandPress={() => handleGanttExpand(ganttTasksForDetailView, data.title, data.subtitle)}
            />
          </Pressable>
        );
      case 'time-series-chart':
        return (
          <Pressable
            onPress={() =>
              handleTimeSeriesExpand(
                data.series,
                data.title,
                data.subtitle,
                data.pageSize,
                data.totalDataPoints,
                data.xAxisLabel,
                data.yAxisLabel
              )
            }
          >
            <TimeSeriesChart
              {...data}
              onDataPointPress={(dataPoint, series) => onAction?.('data-point-press', { dataPoint, series })}
              onExpandPress={() =>
                handleTimeSeriesExpand(
                  data.series,
                  data.title,
                  data.subtitle,
                  data.pageSize,
                  data.totalDataPoints,
                  data.xAxisLabel,
                  data.yAxisLabel
                )
              }
            />
          </Pressable>
        );
      case 'graph-visualization':
        return (
          <GraphVisualization
            {...data}
            onNodePress={(node) => onAction?.('node-press', node)}
            onEdgePress={(edge) => onAction?.('edge-press', edge)}
            onExpandPress={() => handleGraphExpand(data.data, data.title, data.subtitle)}
          />
        );
      case 'code-block':
        return (
          <CodeBlock
            {...data}
            mode={data.mode || 'preview'}
            onViewFullFile={() =>
              handleCodeBlockExpand(data.code, data.language, data.fileName, data.title)
            }
            onCopy={() => onAction?.('copy', data)}
          />
        );
      case 'media':
        return (
          <Media
            {...data}
            mode={presentationMode ? 'full' : 'mini'}
            onExpand={() => handleMediaExpand(data.media)}
            onAction={(action, actionData) => onAction?.(action, actionData)}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            config={data.config}
            onItemPress={(item) => onAction?.('item-press', item)}
            onExpandPress={() => handleDashboardExpand(data.config)}
          />
        );
      case 'dashboard-preview':
        return (
          <DashboardPreview
            config={data.config}
            maxPreviewItems={data.maxPreviewItems}
            onPress={() => handleDashboardExpand(data.config)}
            onLongPress={() => onAction?.('long-press', data.config)}
          />
        );
      case 'data-table':
        return (
          <Pressable
            onPress={() =>
              handleDataTableExpand(data.columns, data.data, data.title, data.subtitle)
            }
          >
            <DataTable
              {...data}
              mode={data.mode || 'preview'}
              onExpandPress={() =>
                handleDataTableExpand(data.columns, data.data, data.title, data.subtitle)
              }
              onRowPress={(row) => onAction?.('row-press', row)}
            />
          </Pressable>
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View>
            {message.metadata?.imageUrl && (
              <Image
                source={{ uri: message.metadata.imageUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}
            {message.content && (
              <MarkdownText
                content={message.content}
                style={styles.messageText}
                color={isOwn ? theme?.textColorOwn || '#FFFFFF' : theme?.textColorOther || '#000000'}
              />
            )}
          </View>
        );
      case 'file':
        return (
          <View style={styles.fileContainer}>
            <Text style={styles.fileIcon}>📎</Text>
            <View style={styles.fileInfo}>
              <Text
                style={[
                  styles.fileName,
                  { color: isOwn ? theme?.textColorOwn || '#FFFFFF' : theme?.textColorOther || '#000000' },
                ]}
              >
                {message.metadata?.fileName || 'File'}
              </Text>
              {message.metadata?.fileSize && (
                <Text style={styles.fileSize}>
                  {(message.metadata.fileSize / 1024).toFixed(2)} KB
                </Text>
              )}
            </View>
          </View>
        );
      default:
        return (
          <MarkdownText
            content={message.content || ''}
            style={styles.messageText}
            color={isOwn ? theme?.textColorOwn || '#FFFFFF' : theme?.textColorOther || '#000000'}
          />
        );
    }
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && showAvatar && (
        <TouchableOpacity
          onPress={() => onAvatarPress?.(message.sender.id)}
          style={styles.avatarContainer}
        >
          {message.sender.avatar ? (
            <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {message.sender.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <View style={[
        styles.messageWrapper,
        isOwn && styles.ownMessageWrapper,
        shouldUseFullWidth && styles.fullWidthWrapper,
      ]}>
        {!isOwn && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}

        {message.replyTo && (
          <View style={styles.replyContainer}>
            <Text style={styles.replyText} numberOfLines={1}>
              {message.replyTo.sender.name}: {message.replyTo.content}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => onPress?.(message)}
          onLongPress={() => onLongPress?.(message)}
          style={[
            styles.messageBubble,
            isOwn
              ? { backgroundColor: theme?.messageBackgroundOwn || '#007AFF' }
              : { backgroundColor: theme?.messageBackgroundOther || '#E5E5EA' },
            message.interactiveComponent && styles.messageBubbleInteractive,
          ]}
        >
          {renderMessageContent()}
        </Pressable>

        {/* Interactive Component */}
        {message.interactiveComponent && (
          <View style={styles.interactiveComponentContainer}>
            {renderInteractiveComponent()}
            {/* Enter Presentation Mode Button */}
            {!presentationMode && onEnterPresentation && shouldUseFullWidth && (
              <TouchableOpacity
                style={styles.enterPresentationButton}
                onPress={() => onEnterPresentation(message)}
                activeOpacity={0.7}
              >
                <Text style={styles.enterPresentationText}>👁️ Expand</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.messageFooter, isOwn && styles.ownMessageFooter]}>
          {showTimestamp && (
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          {isOwn && message.status && (
            <Text style={styles.status}>
              {message.status === 'read' && '✓✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'sent' && '✓'}
              {message.status === 'sending' && '⏱'}
              {message.status === 'failed' && '⚠️'}
            </Text>
          )}
        </View>
      </View>

      {isOwn && showAvatar && <View style={styles.avatarPlaceholderSpace} />}

      {/* Task Detail Bottom Sheet */}
      {selectedTask && (
        <TaskDetailBottomSheet
          visible={showTaskDetail}
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
        />
      )}

      {/* Gantt Chart Detail View */}
      {ganttData && (
        <GanttChartDetailView
          visible={showGanttDetail}
          tasks={ganttData.tasks}
          title={ganttData.title}
          subtitle={ganttData.subtitle}
          onClose={() => setShowGanttDetail(false)}
          onTaskPress={handleTaskPress}
        />
      )}

      {/* Task List Detail View */}
      {taskListData && (
        <TaskListDetailView
          visible={showTaskListDetail}
          tasks={taskListData.tasks}
          title={taskListData.title}
          subtitle={taskListData.subtitle}
          onClose={() => setShowTaskListDetail(false)}
          onTaskPress={handleTaskPress}
        />
      )}

      {/* Time Series Chart Detail View */}
      {timeSeriesData && (
        <TimeSeriesChartDetailView
          visible={showTimeSeriesDetail}
          series={timeSeriesData.series}
          title={timeSeriesData.title}
          subtitle={timeSeriesData.subtitle}
          onClose={() => setShowTimeSeriesDetail(false)}
          pageSize={timeSeriesData.pageSize}
          totalDataPoints={timeSeriesData.totalDataPoints}
          xAxisLabel={timeSeriesData.xAxisLabel}
          yAxisLabel={timeSeriesData.yAxisLabel}
          onDataPointPress={(dataPoint, series) => console.log('Data point pressed:', dataPoint, series)}
        />
      )}

      {/* Graph Visualization Detail View */}
      {graphData && (
        <GraphVisualizationDetailView
          visible={showGraphDetail}
          data={graphData.data}
          title={graphData.title}
          subtitle={graphData.subtitle}
          onClose={() => setShowGraphDetail(false)}
          onNodePress={(node) => console.log('Node pressed in detail:', node)}
          onEdgePress={(edge) => console.log('Edge pressed in detail:', edge)}
        />
      )}

      {/* Code Block Detail View */}
      {codeBlockData && (
        <CodeBlockDetailView
          visible={showCodeBlockDetail}
          code={codeBlockData.code}
          language={codeBlockData.language}
          fileName={codeBlockData.fileName}
          title={codeBlockData.title}
          onClose={() => setShowCodeBlockDetail(false)}
          onCopy={() => console.log('Code copied')}
        />
      )}

      {/* Media Detail View */}
      {mediaData && (
        <MediaDetailView
          visible={showMediaDetail}
          media={mediaData}
          onClose={() => setShowMediaDetail(false)}
        />
      )}

      {/* Dashboard Detail View */}
      {dashboardConfig && (
        <DashboardDetailView
          visible={showDashboardDetail}
          config={dashboardConfig}
          onClose={() => setShowDashboardDetail(false)}
          onItemPress={(item) => console.log('Dashboard item pressed:', item)}
        />
      )}

      {/* DataTable Detail View */}
      {dataTableData && (
        <DataTableDetailView
          visible={showDataTableDetail}
          columns={dataTableData.columns}
          data={dataTableData.data}
          title={dataTableData.title}
          subtitle={dataTableData.subtitle}
          onClose={() => setShowDataTableDetail(false)}
          sortable={true}
          filterable={true}
          paginated={true}
          onRowPress={(row) => console.log('Row pressed in detail:', row)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingLeft: 12,
    paddingRight: 16,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPlaceholderSpace: {
    width: 44,
  },
  messageWrapper: {
    maxWidth: '85%',
    minWidth: '30%',
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  fullWidthWrapper: {
    maxWidth: '100%',
    width: '100%',
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageBubbleInteractive: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  interactiveComponentContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  replyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  replyText: {
    fontSize: 13,
    color: '#666666',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  ownMessageFooter: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    marginRight: 4,
  },
  status: {
    fontSize: 11,
    color: '#007AFF',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#999999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  enterPresentationButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  enterPresentationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
