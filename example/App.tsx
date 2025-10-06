import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import InteractiveComponentsExample from './examples/InteractiveComponentsExample';
import ChatHistoryExample from './examples/ChatHistoryExample';
import MediaExample from './examples/MediaExample';
import LiveStreamingSalesExample from './examples/LiveStreamingSalesExample';
import DashboardExample from './examples/DashboardExample';
import VideoStreamExample from './examples/VideoStreamExample';
import MultiUserStreamingExample from './examples/MultiUserStreamingExample';
import CodeEditorExample from './examples/CodeEditorExample';
import { LoadingState } from './components/LoadingState';
import { ThemeProvider, useTheme, useThemeColors } from '../src/theme';

type ExampleType =
  | 'history'
  | 'interactive'
  | 'media'
  | 'streaming'
  | 'dashboard'
  | 'codeeditor';

interface ExampleItem {
  id: ExampleType;
  title: string;
  description: string;
  icon: string;
  category: string;
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'history',
    title: 'Chat History',
    description: 'Chat conversations with history and search',
    icon: '💬',
    category: 'Chat',
  },
  {
    id: 'interactive',
    title: 'UI Components',
    description: 'Interactive data visualizations and components',
    icon: '📊',
    category: 'Components',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Customizable dashboard layouts',
    icon: '📋',
    category: 'Components',
  },
  {
    id: 'codeeditor',
    title: 'Code Editor',
    description: 'Live code editor with preview',
    icon: '💻',
    category: 'Components',
  },
  {
    id: 'streaming',
    title: 'Live Streaming',
    description: 'Multi-user video streaming',
    icon: '🎥',
    category: 'Media',
  },
  {
    id: 'media',
    title: 'Media Gallery',
    description: 'Image and video galleries',
    icon: '🖼️',
    category: 'Media',
  },
];

function AppContent() {
  const { themeMode, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const [activeExample, setActiveExample] = useState<ExampleType>('history');
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const slideAnim = useState(new Animated.Value(-300))[0];

  // Check URL for room navigation on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pathParts = url.pathname.split('/');
      // If URL contains /room/, automatically switch to streaming example
      if (pathParts.includes('room')) {
        setActiveExample('streaming');
        console.log('[App] Auto-selected streaming example due to room URL');
      }
    }
  }, []);

  // Detect window resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const isMobile = windowWidth < 768;

  // Animate side menu
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sideMenuVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [sideMenuVisible, slideAnim]);

  // Handle example switching with loading state
  const handleExampleChange = (newExample: ExampleType) => {
    if (newExample === activeExample) {
      setSideMenuVisible(false);
      return;
    }

    // Show loading state
    setIsLoadingExample(true);
    setSideMenuVisible(false);

    // Minimum loading duration to ensure smooth transition
    const minLoadingTime = 300;
    const startTime = Date.now();

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      setActiveExample(newExample);

      // Calculate remaining time to maintain minimum loading duration
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setIsLoadingExample(false);
      }, remaining);
    }, 50);
  };

  const renderContent = () => {
    if (isLoadingExample) {
      const currentExample = EXAMPLES.find((ex) => ex.id === activeExample);
      const loadingMessage = currentExample?.title || 'Example';

      return (
        <View style={styles.loadingContainer}>
          <LoadingState message={`Loading ${loadingMessage}...`} size="large" height={400} />
        </View>
      );
    }

    switch (activeExample) {
      case 'interactive':
        return <InteractiveComponentsExample />;
      case 'history':
        return <ChatHistoryExample />;
      case 'media':
        return <MediaExample />;
      case 'streaming':
        return <MultiUserStreamingExample />;
      case 'dashboard':
        return <DashboardExample />;
      case 'codeeditor':
        return <CodeEditorExample />;
      default:
        return null;
    }
  };

  const renderSideMenu = () => {
    const groupedExamples = EXAMPLES.reduce((acc, example) => {
      if (!acc[example.category]) {
        acc[example.category] = [];
      }
      acc[example.category].push(example);
      return acc;
    }, {} as Record<string, ExampleItem[]>);

    return (
      <Modal
        visible={sideMenuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setSideMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSideMenuVisible(false)}
        >
          <Animated.View
            style={[
              styles.sideMenu,
              { backgroundColor: colors.surface, left: slideAnim },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.sideMenuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sideMenuTitle, { color: colors.text }]}>Examples</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSideMenuVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sideMenuContent}>
              {Object.entries(groupedExamples).map(([category, items]) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                    {category}
                  </Text>
                  {items.map((example) => (
                    <TouchableOpacity
                      key={example.id}
                      style={[
                        styles.menuItem,
                        activeExample === example.id && {
                          backgroundColor: colors.primary + '15',
                          borderLeftColor: colors.primary,
                        },
                      ]}
                      onPress={() => handleExampleChange(example.id)}
                    >
                      <Text style={styles.menuItemIcon}>{example.icon}</Text>
                      <View style={styles.menuItemContent}>
                        <Text
                          style={[
                            styles.menuItemTitle,
                            {
                              color:
                                activeExample === example.id ? colors.primary : colors.text,
                            },
                          ]}
                        >
                          {example.title}
                        </Text>
                        <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                          {example.description}
                        </Text>
                      </View>
                      {activeExample === example.id && (
                        <Text style={[styles.activeIndicator, { color: colors.primary }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const currentExample = EXAMPLES.find((ex) => ex.id === activeExample);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={[
          styles.header,
          isMobile && styles.headerMobile,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile, { color: colors.text }]}>
              {currentExample?.title || 'Stash Examples'}
            </Text>
            {!isMobile && currentExample && (
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {currentExample.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.examplesButton, { backgroundColor: colors.primary }]}
            onPress={() => setSideMenuVisible(true)}
          >
            <Text style={[styles.examplesButtonText, { color: colors.textOnPrimary }]}>
              📚 Examples Playground
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: colors.primary }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.themeButtonText, { color: colors.textOnPrimary }]}>
              {themeMode === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Side Menu */}
      {renderSideMenu()}
    </SafeAreaView>
  );
}

// Wrapper component with ThemeProvider
export default function App() {
  return (
    <ThemeProvider initialTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMobile: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examplesButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examplesButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerTitleMobile: {
    fontSize: 16,
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  sideMenuTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  sideMenuContent: {
    flex: 1,
  },
  categorySection: {
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
  },
  activeIndicator: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
