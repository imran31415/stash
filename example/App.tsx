import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import InteractiveComponentsExample from './examples/InteractiveComponentsExample';
import ChatHistoryExample from './examples/ChatHistoryExample';
import MediaExample from './examples/MediaExample';
import LiveStreamingSalesExample from './examples/LiveStreamingSalesExample';
import DashboardExample from './examples/DashboardExample';
import VideoStreamExample from './examples/VideoStreamExample';
import MultiUserStreamingExample from './examples/MultiUserStreamingExample';
import { LoadingState } from './components/LoadingState';
import { ThemeProvider, useTheme, useThemeColors } from '../src/theme';

type TabType = 'history' | 'interactive' | 'media' | 'streaming' | 'dashboard';

function AppContent() {
  const { themeMode, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  // Detect window resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const isMobile = windowWidth < 768;

  // Handle tab switching with loading state
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    // Show loading state
    setIsLoadingTab(true);

    // Minimum loading duration to ensure smooth transition
    const minLoadingTime = 300;
    const startTime = Date.now();

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      setActiveTab(newTab);

      // Calculate remaining time to maintain minimum loading duration
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setIsLoadingTab(false);
      }, remaining);
    }, 50);
  };

  const renderContent = () => {
    if (isLoadingTab) {
      const loadingMessage =
        activeTab === 'history' ? 'Chats' :
        activeTab === 'media' ? 'Media Examples' :
        activeTab === 'streaming' ? 'Streaming' :
        activeTab === 'dashboard' ? 'Dashboards' :
        'UI Components';

      return (
        <View style={styles.loadingContainer}>
          <LoadingState
            message={`Loading ${loadingMessage}...`}
            size="large"
            height={400}
          />
        </View>
      );
    }

    switch (activeTab) {
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile, { color: colors.text }]}>
            {isMobile ? 'Stash Examples' : 'Stash Chat Examples'}
          </Text>
          {!isMobile && <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>React Native Component Library</Text>}
        </View>
        <View style={styles.headerButtons}>
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

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { borderBottomColor: colors.primary }]}
          onPress={() => handleTabChange('history')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.primary : colors.textSecondary }]}>
            💬 Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'interactive' && { borderBottomColor: colors.primary }]}
          onPress={() => handleTabChange('interactive')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, { color: activeTab === 'interactive' ? colors.primary : colors.textSecondary }]}>
            📊 UI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && { borderBottomColor: colors.primary }]}
          onPress={() => handleTabChange('dashboard')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, { color: activeTab === 'dashboard' ? colors.primary : colors.textSecondary }]}>
            📋 Dash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'streaming' && { borderBottomColor: colors.primary }]}
          onPress={() => handleTabChange('streaming')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, { color: activeTab === 'streaming' ? colors.primary : colors.textSecondary }]}>
            🎥 Streaming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'media' && { borderBottomColor: colors.primary }]}
          onPress={() => handleTabChange('media')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, { color: activeTab === 'media' ? colors.primary : colors.textSecondary }]}>
            🖼️ Media
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitleMobile: {
    fontSize: 16,
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatsButton: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chatsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: 18,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
