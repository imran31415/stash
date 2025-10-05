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
  tokenizeCode,
  getTokenColor,
} from './CodeBlock.utils';
import { useComponentColors } from '../../../theme';

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
  const colors = useComponentColors();
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
      // Failed to copy to clipboard
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.codeBlock.headerBackground }]}>
      <View style={styles.headerLeft}>
        <View style={[styles.languageBadge, { backgroundColor: langInfo.color }]}>
          <Text style={styles.languageBadgeText}>{langInfo.icon}</Text>
        </View>
        {(fileName || title) && (
          <Text style={[styles.headerTitle, { color: colors.codeBlock.headerText }]} numberOfLines={1}>
            {fileName || title}
          </Text>
        )}
        {!fileName && !title && (
          <Text style={[styles.headerTitle, { color: colors.codeBlock.headerText }]}>{langInfo.name}</Text>
        )}
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.divider }]}
          onPress={handleCopy}
          accessibilityLabel="Copy code"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.codeBlock.headerText }]}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLineNumber = (lineNumber: number) => (
    <Text style={[styles.lineNumber, { color: colors.codeBlock.lineNumberText }]}>
      {formatLineNumber(lineNumber)}
    </Text>
  );

  const renderCodeLine = (line: string, index: number) => {
    const lineNumber = startLineNumber + index;
    const isHighlighted = highlightLines.includes(lineNumber);

    // Tokenize the line for syntax highlighting
    const tokens = tokenizeCode(line, language);

    return (
      <View
        key={index}
        style={[
          styles.codeLine,
          isHighlighted && { backgroundColor: colors.codeBlock.highlightLine },
        ]}
      >
        {showLineNumbers && (
          <View style={[styles.lineNumberContainer, { backgroundColor: colors.codeBlock.lineNumberBackground }]}>
            {renderLineNumber(lineNumber)}
          </View>
        )}
        <View style={styles.codeContent}>
          <Text selectable>
            {tokens.map((token, tokenIndex) => (
              <Text
                key={tokenIndex}
                style={[
                  styles.codeText,
                  { color: getTokenColor(token.type) }
                ]}
              >
                {token.value || ' '}
              </Text>
            ))}
            {tokens.length === 0 && <Text style={[styles.codeText, { color: colors.codeBlock.text }]}> </Text>}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore && !onViewFullFile) return null;

    return (
      <View style={[styles.footer, { backgroundColor: colors.codeBlock.headerBackground, borderTopColor: colors.codeBlock.border }]}>
        {hasMore && (
          <View style={styles.footerInfo}>
            <Text style={[styles.footerText, { color: colors.codeBlock.headerText }]}>
              Showing {displayLines.length} of {lines.length} lines
            </Text>
          </View>
        )}
        {onViewFullFile && (
          <TouchableOpacity
            style={[styles.viewFullButton, { backgroundColor: colors.primary }]}
            onPress={onViewFullFile}
            accessibilityLabel="View full file"
            accessibilityRole="button"
          >
            <Text style={[styles.viewFullButtonText, { color: colors.textOnPrimary }]}>
              {hasMore ? '👁️ View Full File' : '👁️ Expand'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.codeBlock.background,
        borderColor: colors.codeBlock.border,
      },
      style
    ]}>
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
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
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
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
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
  lineNumberContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    minWidth: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lineNumber: {
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
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  footerText: {
    fontSize: 12,
  },
  viewFullButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewFullButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
