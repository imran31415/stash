import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { tokenizeCode, getTokenColor } from '../CodeBlock.utils';
import type { SupportedLanguage } from '../CodeBlock.types';

interface SyntaxHighlightLayerProps {
  code: string;
  language: SupportedLanguage;
}

export const SyntaxHighlightLayer: React.FC<SyntaxHighlightLayerProps> = React.memo(
  ({ code, language }) => {
    const lines = code.split('\n');

    return (
      <View style={styles.highlightLayer} pointerEvents="none">
        {lines.map((line, index) => {
          const tokens = tokenizeCode(line, language);
          return (
            <View key={`highlight-${index}`} style={styles.highlightLine}>
              <Text>
                {tokens.map((token, tokenIndex) => (
                  <Text
                    key={tokenIndex}
                    style={[styles.codeText, { color: getTokenColor(token.type) }]}
                  >
                    {token.value || ' '}
                  </Text>
                ))}
                {tokens.length === 0 && <Text style={styles.codeText}> </Text>}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
);

SyntaxHighlightLayer.displayName = 'SyntaxHighlightLayer';

const styles = StyleSheet.create({
  highlightLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  highlightLine: {
    minHeight: 20,
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 20,
  },
});
