import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import type { CodeBlockDetailViewProps } from './CodeBlock.types';
import {
  getLanguageInfo,
  getCodeLines,
  calculatePagination,
  getPaginatedCode,
  formatLineNumber,
  copyToClipboard,
} from './CodeBlock.utils';

const THEME = {
  background: '#282C34',
  lineNumberBackground: '#21252B',
  lineNumberText: '#5C6370',
  border: '#21252B',
  headerBackground: '#21252B',
  headerText: '#ABB2BF',
  buttonBackground: '#3E4451',
  buttonText: '#ABB2BF',
  codeText: '#ABB2BF',
  activeButton: '#528BFF',
};

const LINES_PER_PAGE = 100;

export const CodeBlockDetailView: React.FC<CodeBlockDetailViewProps> = ({
  visible,
  code,
  language = 'plaintext',
  fileName,
  title,
  showLineNumbers = true,
  onClose,
  onCopy,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const langInfo = useMemo(() => getLanguageInfo(language), [language]);
  const lines = useMemo(() => getCodeLines(code), [code]);
  const totalLines = lines.length;

  const pagination = useMemo(
    () => calculatePagination(totalLines, LINES_PER_PAGE, currentPage),
    [totalLines, currentPage]
  );

  const paginatedCode = useMemo(
    () => getPaginatedCode(code, pagination.startLine, pagination.endLine),
    [code, pagination.startLine, pagination.endLine]
  );

  const displayLines = useMemo(() => getCodeLines(paginatedCode), [paginatedCode]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(pagination.totalPages);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <View style={[styles.languageBadge, { backgroundColor: langInfo.color }]}>
            <Text style={styles.languageBadgeText}>{langInfo.icon}</Text>
          </View>
          {(fileName || title) && (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {fileName || title}
            </Text>
          )}
          {!fileName && !title && (
            <Text style={styles.headerTitle}>{langInfo.name}</Text>
          )}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleCopy}
            accessibilityLabel="Copy code"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{copied ? '✓' : '📋'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {pagination.totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={handleFirstPage}
            disabled={currentPage === 1}
            accessibilityLabel="First page"
          >
            <Text style={styles.paginationButtonText}>⟪</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
            accessibilityLabel="Previous page"
          >
            <Text style={styles.paginationButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Lines {pagination.startLine}-{pagination.endLine} of {totalLines}
            </Text>
            <Text style={styles.paginationSubtext}>
              Page {currentPage} of {pagination.totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === pagination.totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={handleNextPage}
            disabled={currentPage === pagination.totalPages}
            accessibilityLabel="Next page"
          >
            <Text style={styles.paginationButtonText}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === pagination.totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={handleLastPage}
            disabled={currentPage === pagination.totalPages}
            accessibilityLabel="Last page"
          >
            <Text style={styles.paginationButtonText}>⟫</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCodeLine = (line: string, index: number) => {
    const lineNumber = pagination.startLine + index;

    return (
      <View key={index} style={styles.codeLine}>
        {showLineNumbers && (
          <View style={styles.lineNumberContainer}>
            <Text style={styles.lineNumber}>{formatLineNumber(lineNumber)}</Text>
          </View>
        )}
        <View style={styles.codeContent}>
          <Text style={styles.codeText} selectable>
            {line || ' '}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.headerBackground} />

        {renderHeader()}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          bounces={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={Platform.OS === 'web'}
            bounces={false}
          >
            <View style={styles.codeWrapper}>
              {displayLines.map((line, index) => renderCodeLine(line, index))}
            </View>
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    backgroundColor: THEME.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 12,
  },
  languageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: THEME.headerText,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.buttonBackground,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: THEME.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.buttonBackground,
    borderRadius: 4,
    marginHorizontal: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    opacity: 0.3,
  },
  paginationButtonText: {
    color: THEME.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  paginationInfo: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  paginationText: {
    color: THEME.headerText,
    fontSize: 13,
    fontWeight: '600',
  },
  paginationSubtext: {
    color: THEME.lineNumberText,
    fontSize: 11,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  codeWrapper: {
    paddingVertical: 16,
  },
  codeLine: {
    flexDirection: 'row',
    paddingRight: 16,
    minHeight: 20,
  },
  lineNumberContainer: {
    backgroundColor: THEME.lineNumberBackground,
    paddingHorizontal: 16,
    paddingVertical: 2,
    minWidth: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lineNumber: {
    color: THEME.lineNumberText,
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  codeContent: {
    flex: 1,
    paddingLeft: 16,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  codeText: {
    color: THEME.codeText,
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 20,
  },
});
