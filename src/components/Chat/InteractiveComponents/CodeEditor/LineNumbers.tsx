import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useComponentColors } from '../../../../theme';

interface LineNumbersProps {
  lineCount: number;
}

export const LineNumbers: React.FC<LineNumbersProps> = React.memo(({ lineCount }) => {
  const colors = useComponentColors();

  return (
    <View style={[styles.lineNumbers, { backgroundColor: colors.codeBlock.lineNumberBackground }]}>
      {Array.from({ length: lineCount }, (_, index) => (
        <Text
          key={index}
          style={[styles.lineNumber, { color: colors.codeBlock.lineNumberText }]}
        >
          {String(index + 1).padStart(3, ' ')}
        </Text>
      ))}
    </View>
  );
});

LineNumbers.displayName = 'LineNumbers';

const styles = StyleSheet.create({
  lineNumbers: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
  },
  lineNumber: {
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 20,
    textAlign: 'right',
  },
});
