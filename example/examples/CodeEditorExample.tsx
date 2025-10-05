import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { CodeEditor, CodeEditorDetailView } from '../../src/components/Chat/InteractiveComponents';
import { ThemeProvider } from '../../src/theme';
import { demos, type DemoConfig } from './demos';

const CodeEditorExample: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('gantt');
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [expandedEditor, setExpandedEditor] = useState<'json' | 'impl' | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Memoize currentDemo to ensure stable reference
  const currentDemo = useMemo(() => demos[selectedDemo], [selectedDemo]);

  // Store code per demo to preserve edits when switching
  const [codeByDemo, setCodeByDemo] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(demos).forEach((key) => {
      initial[key] = demos[key].initialCode;
    });
    return initial;
  });

  // Get current code for selected demo
  const code = codeByDemo[selectedDemo];

  const handleCodeChange = useCallback((newCode: string) => {
    setCodeByDemo(prev => ({
      ...prev,
      [selectedDemo]: newCode,
    }));
  }, [selectedDemo]);

  // Parse code and render component dynamically
  const renderPreview = useCallback((currentCode: string) => {
    try {
      const parsedData = currentDemo.parseData(currentCode);

      if (!parsedData) {
        return (
          <View style={styles.errorView}>
            <Text style={styles.errorText}>Invalid JSON data. Please check the format.</Text>
          </View>
        );
      }

      return currentDemo.renderPreview(parsedData);
    } catch (error) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>
            Error: {error instanceof Error ? error.message : 'Invalid JSON'}
          </Text>
        </View>
      );
    }
  }, [currentDemo]);

  return (
    <ThemeProvider initialTheme="light">
      <SafeAreaView style={styles.container}>
        <View style={styles.mainContent}>
          {/* Sidebar Menu */}
          {(!isMobile || menuOpen) && (
            <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Demos</Text>
                {isMobile && (
                  <TouchableOpacity onPress={() => setMenuOpen(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.menuScroll}>
                {Object.entries(demos).map(([key, demo]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.menuItem,
                      selectedDemo === key && styles.menuItemActive,
                    ]}
                    onPress={() => {
                      setSelectedDemo(key);
                      if (isMobile) setMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        selectedDemo === key && styles.menuItemTextActive,
                      ]}
                    >
                      {demo.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main Content Area */}
          <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentScroll}>
            {isMobile && !menuOpen && (
              <TouchableOpacity
                style={styles.menuToggle}
                onPress={() => setMenuOpen(true)}
              >
                <Text style={styles.menuToggleText}>☰ Demos</Text>
              </TouchableOpacity>
            )}

            <CodeEditor
              key={`json-${selectedDemo}`}
              code={code}
              language="json"
              fileName="data.json"
              mode="full"
              editable={true}
              showPreview={true}
              showLineNumbers={true}
              title={currentDemo.title}
              description={currentDemo.description}
              renderPreview={renderPreview}
              onChange={handleCodeChange}
              onExpandPress={() => setExpandedEditor('json')}
              height={600}
            />

            <View style={styles.spacer} />

            <CodeEditor
              key={`impl-${selectedDemo}`}
              code={currentDemo.implementationCode}
              language="typescript"
              fileName="example.tsx"
              mode="full"
              editable={false}
              showPreview={false}
              showLineNumbers={true}
              title="Stash Library Implementation"
              description="Copy this code to use in your project"
              onExpandPress={() => setExpandedEditor('impl')}
              height={700}
            />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* JSON Editor Detail View */}
      <CodeEditorDetailView
        visible={expandedEditor === 'json'}
        onClose={() => setExpandedEditor(null)}
        code={code}
        language="json"
        fileName="data.json"
        title={currentDemo.title}
        description={currentDemo.description}
        editable={true}
        showPreview={true}
        showLineNumbers={true}
        renderPreview={renderPreview}
        onChange={handleCodeChange}
      />

      {/* Implementation Code Detail View */}
      <CodeEditorDetailView
        visible={expandedEditor === 'impl'}
        onClose={() => setExpandedEditor(null)}
        code={currentDemo.implementationCode}
        language="typescript"
        fileName="example.tsx"
        title="Stash Library Implementation"
        description="Copy this code to use in your project"
        editable={false}
        showPreview={false}
        showLineNumbers={true}
      />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    paddingHorizontal: 8,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  menuItemTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  contentScroll: {
    padding: 16,
  },
  menuToggle: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  menuToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 24,
  },
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CodeEditorExample;
