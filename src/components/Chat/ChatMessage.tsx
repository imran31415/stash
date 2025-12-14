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
import { useThemeColors } from '../../theme';
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
  CodeEditor,
  Media,
  MediaDetailView,
  Dashboard,
  DashboardDetailView,
  DashboardPreview,
  DataTable,
  DataTableDetailView,
  ComparisonTable,
  ComparisonTableDetailView,
  Workflow,
  WorkflowDetailView,
  FlameGraph,
  VideoStream,
  VideoStreamDetailView,
  LiveCameraStream,
  TreeView,
  TreeViewDetailView,
  MultiSwipeable,
  KanbanBoard,
  KanbanBoardDetailView,
} from './InteractiveComponents';
import type { Task, TimeSeriesSeries, GraphData, SupportedLanguage, MediaItem, DashboardConfig, ColumnDefinition, RowData, VideoStreamData, TreeViewData, SwipeableItem, KanbanBoardData, ComparisonTableData } from './InteractiveComponents';
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
  const colors = useThemeColors();
  const isOwn = message?.isOwn ?? false;
  const isSystem = message?.type === 'system';

  // Check if message type should use full width in presentation mode
  const shouldUseFullWidth = presentationMode && (
    message?.type === 'image' ||
    (message?.interactiveComponent &&
      ['gantt-chart', 'task-list', 'time-series-chart', 'graph-visualization', 'code-block', 'media', 'dashboard', 'data-table', 'multi-swipeable'].includes(
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
    enableLiveStreaming?: boolean;
    streamingPaused?: boolean;
    onStreamingToggle?: (isActive: boolean) => void;
    streamingCallbackId?: string;
    streamingWindowSize?: number;
    maxDataPoints?: number;
    showStreamingControls?: boolean;
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
  const [showWorkflowDetail, setShowWorkflowDetail] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [showFlameGraphDetail, setShowFlameGraphDetail] = useState(false);
  const [flameGraphData, setFlameGraphData] = useState<any>(null);
  const [showVideoStreamDetail, setShowVideoStreamDetail] = useState(false);
  const [videoStreamData, setVideoStreamData] = useState<VideoStreamData | null>(null);
  const [showTreeViewDetail, setShowTreeViewDetail] = useState(false);
  const [treeViewData, setTreeViewData] = useState<TreeViewData | null>(null);
  const [showKanbanDetail, setShowKanbanDetail] = useState(false);
  const [kanbanData, setKanbanData] = useState<KanbanBoardData | null>(null);
  const [showComparisonTableDetail, setShowComparisonTableDetail] = useState(false);
  const [comparisonTableData, setComparisonTableData] = useState<ComparisonTableData | null>(null);

  // Loading state for AI messages
  if (isLoading) {
    return (
      <View style={[styles.container, styles.otherContainer]}>
        {showAvatar && (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.avatarBackground }]}>
            <Text style={[styles.avatarText, { color: colors.textOnPrimary }]}>AI</Text>
          </View>
        )}
        <View style={styles.messageWrapper}>
          <View style={[styles.messageBubble, { backgroundColor: colors.messageBubbleOther }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={[styles.systemMessageText, { color: colors.systemMessageText, backgroundColor: colors.systemMessageBackground }]}>{message.content}</Text>
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
    yAxisLabel?: string,
    enableLiveStreaming?: boolean,
    streamingPaused?: boolean,
    onStreamingToggle?: (isActive: boolean) => void,
    streamingCallbackId?: string,
    streamingWindowSize?: number,
    maxDataPoints?: number,
    showStreamingControls?: boolean
  ) => {
    setTimeSeriesData({
      series,
      title,
      subtitle,
      pageSize,
      totalDataPoints,
      xAxisLabel,
      yAxisLabel,
      enableLiveStreaming,
      streamingPaused,
      onStreamingToggle,
      streamingCallbackId,
      streamingWindowSize,
      maxDataPoints,
      showStreamingControls
    });
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

  const handleWorkflowExpand = (workflowData: any) => {
    setWorkflowData(workflowData);
    setShowWorkflowDetail(true);
  };

  const handleFlameGraphExpand = (flameGraphData: any) => {
    setFlameGraphData(flameGraphData);
    setShowFlameGraphDetail(true);
  };

  const handleVideoStreamExpand = (videoStreamData: VideoStreamData) => {
    setVideoStreamData(videoStreamData);
    setShowVideoStreamDetail(true);
  };

  const handleTreeViewExpand = (treeViewData: TreeViewData) => {
    setTreeViewData(treeViewData);
    setShowTreeViewDetail(true);
  };

  const handleKanbanExpand = (kanbanData: KanbanBoardData) => {
    setKanbanData(kanbanData);
    setShowKanbanDetail(true);
  };

  const handleComparisonTableExpand = (data: ComparisonTableData) => {
    setComparisonTableData(data);
    setShowComparisonTableDetail(true);
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
                data.yAxisLabel,
                data.enableLiveStreaming,
                data.streamingPaused,
                data.onStreamingToggle,
                data.streamingCallbackId,
                data.streamingWindowSize,
                data.maxDataPoints,
                data.showStreamingControls
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
                  data.yAxisLabel,
                  data.enableLiveStreaming,
                  data.streamingPaused,
                  data.onStreamingToggle,
                  data.streamingCallbackId,
                  data.streamingWindowSize,
                  data.maxDataPoints,
                  data.showStreamingControls
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
      case 'code-editor':
        return (
          <CodeEditor
            {...data}
            mode={data.mode || 'mini'}
            editable={data.editable ?? false}
            showPreview={data.showPreview ?? true}
            showLineNumbers={data.showLineNumbers ?? true}
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
            mode="mini"
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
      case 'comparison-table':
        return (
          <Pressable onPress={() => handleComparisonTableExpand(data)}>
            <ComparisonTable
              data={data}
              mode={data.mode || 'mini'}
              onExpandPress={() => handleComparisonTableExpand(data)}
              onCellPress={(row, column, cell) => onAction?.('cell-press', { row, column, cell })}
            />
          </Pressable>
        );
      case 'workflow':
      case 'dag':
        return (
          <Workflow
            data={data}
            mode={data.mode || 'mini'}
            onNodePress={(node) => onAction?.('node-press', node)}
            onExpandPress={() => handleWorkflowExpand(data)}
          />
        );
      case 'flamegraph':
      case 'flame-graph':
        return (
          <FlameGraph
            {...data}
            mode={data.mode || 'preview'}
            onNodeClick={(node) => onAction?.('node-press', node)}
            onExpandPress={() => handleFlameGraphExpand(data)}
          />
        );
      case 'tree-view':
        return (
          <TreeView
            data={data.data || data}
            mode={data.mode || 'mini'}
            onNodePress={(node, path) => onAction?.('node-press', { node, path })}
            onExpandPress={() => handleTreeViewExpand(data.data || data)}
          />
        );
      case 'kanban-board':
        return (
          <KanbanBoard
            data={data.data || data}
            mode={data.mode || 'mini'}
            showStats={data.showStats !== false}
            onCardPress={(card, column) => onAction?.('card-press', { card, column })}
            onColumnPress={(column) => onAction?.('column-press', column)}
            onExpandPress={() => handleKanbanExpand(data.data || data)}
          />
        );
      case 'video-stream':
        return (
          <VideoStream
            data={data}
            mode={presentationMode ? 'full' : (data.mode || 'mini')}
            onPlay={() => onAction?.('play', data)}
            onPause={() => onAction?.('pause', data)}
            onEnded={() => onAction?.('ended', data)}
            onError={(error) => onAction?.('error', error)}
            onExpandPress={() => handleVideoStreamExpand(data)}
          />
        );
      case 'live-camera-stream':
        return (
          <LiveCameraStream
            mode={presentationMode ? 'full' : (data.mode || 'mini')}
            autoStart={data.autoStart}
            showControls={data.showControls !== false}
            enableFlip={data.enableFlip !== false}
            onStreamStart={() => onAction?.('stream-start', data)}
            onStreamStop={() => onAction?.('stream-stop', data)}
            onError={(error) => onAction?.('error', error)}
          />
        );
      case 'multi-swipeable':
        return (
          <MultiSwipeable
            items={data.items || []}
            mode={presentationMode ? 'full' : (data.mode || 'preview')}
            initialIndex={data.initialIndex}
            showDots={data.showDots}
            showArrows={data.showArrows}
            autoAdvanceInterval={data.autoAdvanceInterval}
            onItemChange={(index, item) => onAction?.('item-change', { index, item })}
            onExpandPress={(item, index) => onAction?.('expand-press', { item, index })}
            onItemAction={(action, actionData, itemIndex) => onAction?.('item-action', { action, data: actionData, itemIndex })}
          />
        );
      case 'custom':
        // Custom renderer for user-defined components
        console.log('[ChatMessage] Custom renderer case - has customRenderer?', !!message.interactiveComponent?.customRenderer);
        if (message.interactiveComponent?.customRenderer) {
          console.log('[ChatMessage] Calling customRenderer function');
          const rendered = message.interactiveComponent.customRenderer();
          console.log('[ChatMessage] customRenderer returned:', rendered);
          return rendered;
        }
        return null;
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
                color={isOwn ? theme?.textColorOwn || colors.messageTextOwn : theme?.textColorOther || colors.messageTextOther}
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
                  { color: isOwn ? theme?.textColorOwn || colors.messageTextOwn : theme?.textColorOther || colors.messageTextOther },
                ]}
              >
                {message.metadata?.fileName || 'File'}
              </Text>
              {message.metadata?.fileSize && (
                <Text style={[styles.fileSize, { color: colors.textTertiary }]}>
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
            color={isOwn ? theme?.textColorOwn || colors.messageTextOwn : theme?.textColorOther || colors.messageTextOther}
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
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.avatarBackground }]}>
              <Text style={[styles.avatarText, { color: colors.textOnPrimary }]}>
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
          <Text style={[styles.senderName, { color: colors.textSecondary }]}>{message.sender.name}</Text>
        )}

        {message.replyTo && (
          <View style={[styles.replyContainer, { borderLeftColor: colors.replyBorder }]}>
            <Text style={[styles.replyText, { color: colors.textSecondary }]} numberOfLines={1}>
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
              ? { backgroundColor: theme?.messageBackgroundOwn || colors.messageBubbleOwn }
              : { backgroundColor: theme?.messageBackgroundOther || colors.messageBubbleOther },
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
                style={[styles.enterPresentationButton, { backgroundColor: colors.primary }]}
                onPress={() => onEnterPresentation(message)}
                activeOpacity={0.7}
              >
                <Text style={[styles.enterPresentationText, { color: colors.textOnPrimary }]}>👁️ Expand</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.messageFooter, isOwn && styles.ownMessageFooter]}>
          {showTimestamp && (
            <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          {isOwn && message.status && (
            <Text style={[styles.status, { color: colors.primary }]}>
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
          enableLiveStreaming={timeSeriesData.enableLiveStreaming}
          streamingPaused={timeSeriesData.streamingPaused}
          onStreamingToggle={timeSeriesData.onStreamingToggle}
          streamingCallbackId={timeSeriesData.streamingCallbackId}
          streamingWindowSize={timeSeriesData.streamingWindowSize}
          maxDataPoints={timeSeriesData.maxDataPoints}
          showStreamingControls={timeSeriesData.showStreamingControls}
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

      {/* Workflow Detail View */}
      {workflowData && (
        <WorkflowDetailView
          visible={showWorkflowDetail}
          data={workflowData.data}
          title={workflowData.title}
          subtitle={workflowData.subtitle}
          onClose={() => setShowWorkflowDetail(false)}
          onNodePress={(node) => console.log('Node pressed in detail:', node)}
          showLabels={true}
          showEdgeLabels={true}
          showStatus={true}
        />
      )}

      {/* FlameGraph Detail View - Use full mode FlameGraph */}
      {flameGraphData && showFlameGraphDetail && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlameGraph
              {...flameGraphData}
              mode="detail"
              onNodeClick={(node) => console.log('Node clicked in detail:', node)}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFlameGraphDetail(false)}
            >
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* VideoStream Detail View */}
      {videoStreamData && (
        <VideoStreamDetailView
          visible={showVideoStreamDetail}
          data={videoStreamData}
          onClose={() => setShowVideoStreamDetail(false)}
          showMetadata={true}
        />
      )}

      {/* TreeView Detail View */}
      {showTreeViewDetail && treeViewData && (
        <TreeViewDetailView
          data={treeViewData}
          visible={showTreeViewDetail}
          onClose={() => setShowTreeViewDetail(false)}
        />
      )}

      {/* KanbanBoard Detail View */}
      {showKanbanDetail && kanbanData && (
        <KanbanBoardDetailView
          data={kanbanData}
          visible={showKanbanDetail}
          onClose={() => setShowKanbanDetail(false)}
        />
      )}

      {/* ComparisonTable Detail View */}
      {showComparisonTableDetail && comparisonTableData && (
        <ComparisonTableDetailView
          data={comparisonTableData}
          visible={showComparisonTableDetail}
          onClose={() => setShowComparisonTableDetail(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPlaceholderSpace: {
    width: 44,
  },
  messageWrapper: {
    flex: 1,
    maxWidth: '80%',
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
    marginBottom: 2,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageBubbleInteractive: {
    paddingHorizontal: 4,
    paddingVertical: 4,
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
    marginTop: 2,
  },
  replyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  replyText: {
    fontSize: 13,
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
    marginRight: 4,
  },
  status: {
    fontSize: 11,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  systemMessageText: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  enterPresentationButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  enterPresentationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
