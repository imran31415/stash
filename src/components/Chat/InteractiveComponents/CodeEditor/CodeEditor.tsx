import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import type { CodeEditorProps, CodeFile, CodeEditorTab } from './CodeEditor.types';
import { useComponentColors } from '../../../../theme';
import { borderRadius, shadows, spacing } from '../shared';
import { ComponentHeader } from '../shared/components/ComponentHeader';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { CodeBlock } from '../CodeBlock';
import { LineNumbers } from './LineNumbers';
import { EditableCodeInput } from './EditableCodeInput';

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files: providedFiles,
  code: singleCode,
  language: singleLanguage = 'javascript',
  fileName: singleFileName,
  mode = 'full',
  layout: providedLayout,
  height = 600,
  width,
  editable = true,
  showFileTree = false,
  showPreview = true,
  showLineNumbers = true,
  showHeader = true,
  renderPreview,
  previewErrorFallback,
  onChange,
  onFileSelect,
  onExpandPress,
  onPreviewExpandPress,
  title = 'Code Editor',
  description,
  style,
}) => {
  const colors = useComponentColors();
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const isMobile = screenWidth < 768;

  // Auto-detect layout: tabs for mobile/mini, split for desktop full mode
  const layout = providedLayout || (isMobile || isMini ? 'tabs' : 'split');

  // Normalize to files array (support both single file and multi-file APIs)
  const files = useMemo<CodeFile[]>(() => {
    if (providedFiles && providedFiles.length > 0) {
      return providedFiles;
    }
    return [
      {
        id: 'default',
        name: singleFileName || 'index.js',
        code: singleCode || '',
        language: singleLanguage,
      },
    ];
  }, [providedFiles, singleCode, singleLanguage, singleFileName]);

  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || 'default');
  const [activeTab, setActiveTab] = useState<CodeEditorTab>('code');
  const [expandedPane, setExpandedPane] = useState<'code' | 'preview' | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    files.forEach((file) => {
      initial[file.id] = file.code;
    });
    return initial;
  });

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) || files[0],
    [files, activeFileId]
  );

  const currentCode = fileContents[activeFileId] || activeFile?.code || '';

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setFileContents((prev) => ({
        ...prev,
        [activeFileId]: newCode,
      }));
      onChange?.(newCode, activeFileId);
    },
    [activeFileId, onChange]
  );

  const handleFileSelect = useCallback(
    (file: CodeFile) => {
      setActiveFileId(file.id);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const renderFileTree = () => {
    if (!showFileTree || files.length <= 1) return null;

    return (
      <View style={[styles.fileTree, { borderRightColor: colors.border }]}>
        <Text style={[styles.fileTreeTitle, { color: colors.textSecondary }]}>FILES</Text>
        {files.map((file) => (
          <TouchableOpacity
            key={file.id}
            style={[
              styles.fileItem,
              activeFileId === file.id && {
                backgroundColor: colors.primary + '20',
                borderLeftColor: colors.primary,
              },
            ]}
            onPress={() => handleFileSelect(file)}
          >
            <Text
              style={[
                styles.fileName,
                { color: activeFileId === file.id ? colors.primary : colors.text },
              ]}
              numberOfLines={1}
            >
              📄 {file.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCodePane = useCallback(() => {
    const language = activeFile?.language || 'javascript';

    // If not editable, use CodeBlock for syntax highlighting
    if (!editable) {
      return (
        <View style={styles.codePane}>
          <View style={[styles.languageHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.languageInfo}>
              <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>Language:</Text>
              <Text style={[styles.languageValue, { color: colors.text }]}>{language}</Text>
            </View>
            {layout === 'split' && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setExpandedPane(expandedPane === 'code' ? null : 'code')}
              >
                <Text style={[styles.expandIcon, { color: colors.primary }]}>
                  {expandedPane === 'code' ? '⊗' : '⛶'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
          >
            <CodeBlock
              code={currentCode}
              language={language}
              fileName={activeFile?.name}
              mode="full"
              showLineNumbers={showLineNumbers}
              style={styles.codeBlock}
            />
          </ScrollView>
        </View>
      );
    }

    // Editable mode with syntax highlighting
    const lineCount = currentCode.split('\n').length;

    return (
      <View style={[styles.codePane, { backgroundColor: colors.codeBlock.background }]}>
        <View style={[styles.languageHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.languageInfo}>
            <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>Language:</Text>
            <Text style={[styles.languageValue, { color: colors.text }]}>{language}</Text>
          </View>
          {layout === 'split' && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpandedPane(expandedPane === 'code' ? null : 'code')}
            >
              <Text style={[styles.expandIcon, { color: colors.primary }]}>
                {expandedPane === 'code' ? '⊗' : '⛶'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.editorScroll}
          contentContainerStyle={styles.editorScrollContent}
        >
          <View style={styles.editorContainer}>
            <View style={styles.editorContent}>
              {showLineNumbers && <LineNumbers lineCount={lineCount} />}
              <EditableCodeInput
                code={currentCode}
                language={language}
                onCodeChange={handleCodeChange}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }, [editable, currentCode, activeFile?.language, activeFile?.name, showLineNumbers, colors.codeBlock.background, colors.surface, colors.border, colors.text, colors.textSecondary, handleCodeChange, layout, expandedPane]);

  const renderPreviewPane = () => {
    if (!showPreview || !renderPreview) {
      return (
        <View style={styles.previewContainer}>
          <View style={styles.emptyPreview}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No preview available
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.previewContainer}>
        {layout === 'split' && (
          <View style={[styles.previewHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
            <View style={styles.previewHeaderActions}>
              {onPreviewExpandPress && (
                <TouchableOpacity
                  style={[styles.viewDetailButton, { backgroundColor: colors.primary }]}
                  onPress={onPreviewExpandPress}
                >
                  <Text style={[styles.viewDetailText, { color: '#FFFFFF' }]}>
                    👁️ View Detail
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setExpandedPane(expandedPane === 'preview' ? null : 'preview')}
              >
                <Text style={[styles.expandIcon, { color: colors.primary }]}>
                  {expandedPane === 'preview' ? '⊗' : '⛶'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <ErrorBoundary
          fallback={(error) =>
            previewErrorFallback ? (
              previewErrorFallback(error)
            ) : (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorTitle, { color: colors.error }]}>Preview Error</Text>
                <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                  {error.message}
                </Text>
              </View>
            )
          }
        >
          <View style={styles.previewContent}>
            {renderPreview(currentCode, activeFile?.language, onPreviewExpandPress)}
          </View>
        </ErrorBoundary>
      </View>
    );
  };

  const renderTabs = () => {
    if (layout !== 'tabs') return null;

    return (
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'code' && [styles.tabActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('code')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'code' ? colors.primary : colors.textSecondary },
            ]}
          >
            📝 Code
          </Text>
        </TouchableOpacity>
        {showPreview && (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'preview' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('preview')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'preview' ? colors.primary : colors.textSecondary },
              ]}
            >
              👁️ Preview
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (layout === 'tabs') {
      return (
        <View style={styles.tabbedContent}>
          {activeTab === 'code' ? renderCodePane() : renderPreviewPane()}
        </View>
      );
    }

    // Split layout
    return (
      <View style={styles.splitContent}>
        {(!expandedPane || expandedPane === 'code') && (
          <View style={[
            styles.splitPane,
            { borderRightColor: colors.border },
            expandedPane === 'code' && styles.splitPaneExpanded,
          ]}>
            {renderCodePane()}
          </View>
        )}
        {showPreview && (!expandedPane || expandedPane === 'preview') && (
          <View style={[
            styles.splitPane,
            expandedPane === 'preview' && styles.splitPaneExpanded,
          ]}>
            {renderPreviewPane()}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          ...(height ? { height } : { flex: 1 }),
          width: width || '100%',
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isMini && styles.containerMini,
        style,
      ]}
    >
      {showHeader && (
        <ComponentHeader
          title={title}
          description={description}
          isMini={isMini}
          onExpandPress={onExpandPress}
        />
      )}

      {renderTabs()}

      <View style={styles.body}>
        {renderFileTree()}
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerMini: {
    borderRadius: borderRadius.md,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fileTree: {
    width: 200,
    borderRightWidth: 1,
    paddingVertical: spacing.sm,
  },
  fileTreeTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  fileItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabbedContent: {
    flex: 1,
  },
  splitContent: {
    flex: 1,
    flexDirection: 'row',
  },
  splitPane: {
    flex: 1,
    borderRightWidth: 1,
  },
  splitPaneExpanded: {
    flex: 1,
    borderRightWidth: 0,
  },
  codePane: {
    flex: 1,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  languageValue: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewDetailButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandButton: {
    padding: spacing.xs,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  codeBlock: {
    // Removed flex: 1 to allow proper scrolling
    marginVertical: 0,
    borderWidth: 0,
    borderRadius: 0,
  },
  editorScroll: {
    flex: 1,
  },
  editorScrollContent: {
    // Removed flexGrow to fix scroll-to-bottom issue
  },
  editorContainer: {
    // Removed flex: 1 to allow proper content height measurement
  },
  editorContent: {
    flexDirection: 'row',
    // Removed flex: 1 to allow proper content height measurement
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    flex: 1,
    padding: spacing.md,
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
