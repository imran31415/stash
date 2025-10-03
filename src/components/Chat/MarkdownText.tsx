import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';

interface MarkdownTextProps {
  content: string;
  style?: any;
  color?: string;
}

/**
 * Simple markdown renderer for React Native
 * Supports:
 * - Headers (## text)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Inline code (`code`)
 * - Line breaks
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, style, color = '#000000' }) => {
  const renderLine = (line: string, index: number) => {
    // Skip empty lines
    if (!line.trim()) {
      return <View key={index} style={{ height: 8 }} />;
    }

    // Headers (## text or ### text)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const fontSize = level === 1 ? 24 : level === 2 ? 20 : level === 3 ? 18 : 16;
      const fontWeight = level <= 2 ? '700' : '600';

      return (
        <Text
          key={index}
          style={[
            styles.header,
            { fontSize, fontWeight: fontWeight as any, color, marginTop: index > 0 ? 12 : 0 },
          ]}
        >
          {parseInlineMarkdown(text, color)}
        </Text>
      );
    }

    // Regular text with inline markdown
    return (
      <Text key={index} style={[styles.text, { color }, style]}>
        {parseInlineMarkdown(line, color)}
      </Text>
    );
  };

  const parseInlineMarkdown = (text: string, textColor: string) => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold (**text** or __text__)
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        elements.push(
          <Text key={key++} style={[styles.bold, { color: textColor }]}>
            {boldMatch[2]}
          </Text>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic (*text* or _text_)
      const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
      if (italicMatch) {
        elements.push(
          <Text key={key++} style={[styles.italic, { color: textColor }]}>
            {italicMatch[2]}
          </Text>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Inline code (`code`)
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <Text key={key++} style={styles.inlineCode}>
            {codeMatch[1]}
          </Text>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Regular character
      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return elements;
  };

  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, index) => renderLine(line, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
    lineHeight: 28,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
});
