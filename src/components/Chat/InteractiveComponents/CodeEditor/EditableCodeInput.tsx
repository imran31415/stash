import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { useComponentColors } from '../../../../theme';
import { SyntaxHighlightLayer } from './SyntaxHighlightLayer';
import type { SupportedLanguage } from '../CodeBlock.types';

interface EditableCodeInputProps {
  code: string;
  language: SupportedLanguage;
  onCodeChange: (code: string) => void;
  placeholder?: string;
}

export const EditableCodeInput: React.FC<EditableCodeInputProps> = React.memo(
  ({ code, language, onCodeChange, placeholder = 'Start typing code...' }) => {
    const colors = useComponentColors();

    const textInputStyle = React.useMemo(
      () => [
        styles.textInput,
        {
          color: 'transparent',
          caretColor: colors.primary,
          fontFamily: Platform.select({
            ios: 'Menlo',
            android: 'monospace',
            default: 'monospace',
          }),
        },
      ],
      [colors.primary]
    );

    return (
      <View style={styles.codeColumn}>
        <SyntaxHighlightLayer code={code} language={language} />
        <TextInput
          style={textInputStyle}
          value={code}
          onChangeText={onCodeChange}
          multiline
          scrollEnabled={false}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          selectTextOnFocus={false}
          selectionColor={colors.primary + '40'}
        />
      </View>
    );
  }
);

EditableCodeInput.displayName = 'EditableCodeInput';

const styles = StyleSheet.create({
  codeColumn: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlignVertical: 'top',
  },
});
