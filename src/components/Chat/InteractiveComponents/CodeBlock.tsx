import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import type { CodeBlockProps } from './CodeBlock.types';
import {
  getLanguageInfo,
  getCodeLines,
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
  languageBadge: '#3E4451',
  buttonBackground: '#3E4451',
  buttonText: '#ABB2BF',
  codeText: '#ABB2BF',
  highlightLine: '#2C313A',
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'plaintext',
  fileName,
  mode = 'preview',
  title,
  showLineNumbers = true,
  startLineNumber = 1,
  highlightLines = [],
  maxLines,
  onViewFullFile,
  onCopy,
  style,
}) => {
  const [copied, setCopied] = useState(false);
  
  const langInfo = useMemo(() => getLanguageInfo(language), [language]);
  const lines = useMemo(() => getCodeLines(code), [code]);
  
  // Determine how many lines to show based on mode
  const defaultMaxLines = mode === 'mini' ? 5 : mode === 'preview' ? 15 : lines.length;
  const displayMaxLines = maxLines ?? defaultMaxLines;
  const displayLines = lines.slice(0, displayMaxLines);
  const hasMore = lines.length > displayMaxLines;

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Copied!', 'Code copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
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
          <Text style={styles.buttonText}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLineNumber = (lineNumber: number) => (
    <Text style={styles.lineNumber}>
      {formatLineNumber(lineNumber)}
    </Text>
  );

  const renderCodeLine = (line: string, index: number) => {
    const lineNumber = startLineNumber + index;
    const isHighlighted = highlightLines.includes(lineNumber);

    return (
      <View
        key={index}
        style={[
          styles.codeLine,
          isHighlighted && styles.highlightedLine,
        ]}
      >
        {showLineNumbers && (
          <View style={styles.lineNumberContainer}>
            {renderLineNumber(lineNumber)}
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

  const renderFooter = () => {
    if (!hasMore && !onViewFullFile) return null;

    return (
      <View style={styles.footer}>
        {hasMore && (
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Showing {displayLines.length} of {lines.length} lines
            </Text>
          </View>
        )}
        {onViewFullFile && (
          <TouchableOpacity
            style={styles.viewFullButton}
            onPress={onViewFullFile}
            accessibilityLabel="View full file"
            accessibilityRole="button"
          >
            <Text style={styles.viewFullButtonText}>
              {hasMore ? 'View Full File →' : 'Expand →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.codeContainer}
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        bounces={false}
      >
        <View style={styles.codeWrapper}>
          {displayLines.map((line, index) => renderCodeLine(line, index))}
        </View>
      </ScrollView>

      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  languageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: THEME.headerText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: THEME.buttonBackground,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: THEME.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  codeContainer: {
    maxHeight: 500,
  },
  codeWrapper: {
    paddingVertical: 8,
  },
  codeLine: {
    flexDirection: 'row',
    paddingRight: 12,
    minHeight: 20,
  },
  highlightedLine: {
    backgroundColor: THEME.highlightLine,
  },
  lineNumberContainer: {
    backgroundColor: THEME.lineNumberBackground,
    paddingHorizontal: 12,
    paddingVertical: 2,
    minWidth: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lineNumber: {
    color: THEME.lineNumberText,
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  codeContent: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  codeText: {
    color: THEME.codeText,
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.headerBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  footerInfo: {
    flex: 1,
  },
  footerText: {
    color: THEME.headerText,
    fontSize: 12,
  },
  viewFullButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.buttonBackground,
    borderRadius: 4,
  },
  viewFullButtonText: {
    color: THEME.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
});
