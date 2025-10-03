import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import InteractiveComponentsExample from './examples/InteractiveComponentsExample';
import ChatHistoryExample from './examples/ChatHistoryExample';
import { LoadingState } from '../src/components/Chat/InteractiveComponents';

type TabType = 'history' | 'interactive';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [isLoadingTab, setIsLoadingTab] = useState(false);

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
      return (
        <View style={styles.loadingContainer}>
          <LoadingState
            message={`Loading ${activeTab === 'history' ? 'Chats' : 'UI Components'}...`}
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stash Chat Examples</Text>
        <Text style={styles.headerSubtitle}>React Native Component Library</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => handleTabChange('history')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            💬 Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'interactive' && styles.tabActive]}
          onPress={() => handleTabChange('interactive')}
          disabled={isLoadingTab}
        >
          <Text style={[styles.tabText, activeTab === 'interactive' && styles.tabTextActive]}>
            📊 UI
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
