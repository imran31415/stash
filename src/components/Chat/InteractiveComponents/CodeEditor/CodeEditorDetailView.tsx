import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { CodeEditor } from './CodeEditor';
import type { CodeFile } from './CodeEditor.types';
import type { SupportedLanguage } from '../CodeBlock.types';

export interface CodeEditorDetailViewProps {
  visible: boolean;
  onClose: () => void;
  files?: CodeFile[];
  code?: string;
  language?: SupportedLanguage;
  fileName?: string;
  title?: string;
  description?: string;
  editable?: boolean;
  showPreview?: boolean;
  showLineNumbers?: boolean;
  renderPreview?: (code: string, language?: SupportedLanguage, onExpandPress?: () => void) => React.ReactNode;
  onPreviewExpandPress?: () => void;
  onChange?: (code: string) => void;
}

const THEME = {
  background: '#F8FAFC',
  headerBackground: '#FFFFFF',
  headerText: '#1E293B',
  border: '#E2E8F0',
  closeButton: '#DC2626',
};

export const CodeEditorDetailView: React.FC<CodeEditorDetailViewProps> = ({
  visible,
  onClose,
  files,
  code,
  language = 'javascript',
  fileName,
  title = 'Code Editor',
  description,
  editable = true,
  showPreview = true,
  showLineNumbers = true,
  renderPreview,
  onPreviewExpandPress,
  onChange,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.headerBackground} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{title}</Text>
            {description && (
              <Text style={styles.headerDescription}>{description}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Full-height CodeEditor */}
        <View style={styles.editorContainer}>
          <CodeEditor
            files={files}
            code={code}
            language={language}
            fileName={fileName}
            mode="full"
            height={undefined}
            editable={editable}
            showPreview={showPreview}
            showLineNumbers={showLineNumbers}
            renderPreview={renderPreview}
            onPreviewExpandPress={onPreviewExpandPress}
            onChange={onChange}
            showHeader={false}
          />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    color: THEME.headerText,
    fontSize: 18,
    fontWeight: '700',
  },
  headerDescription: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.closeButton,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  editorContainer: {
    flex: 1,
  },
});
