import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { TabName } from '../types/catalog';

interface BottomNavBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {/* 1. VAULT */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'vault' && styles.tabButtonActive]}
        onPress={() => onTabChange('vault')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'vault' && styles.tabIconActive]}>
          🗃️
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'vault' && styles.tabLabelActive]}>
          VAULT
        </Text>
      </TouchableOpacity>

      {/* 2. GALLERY */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'gallery' && styles.tabButtonActive]}
        onPress={() => onTabChange('gallery')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'gallery' && styles.tabIconActive]}>
          ⊞
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'gallery' && styles.tabLabelActive]}>
          GALLERY
        </Text>
      </TouchableOpacity>

      {/* 3. STATS */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'stats' && styles.tabButtonActive]}
        onPress={() => onTabChange('stats')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'stats' && styles.tabIconActive]}>
          📈
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>
          STATS
        </Text>
      </TouchableOpacity>

      {/* 4. SETTINGS */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
        onPress={() => onTabChange('settings')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabIconActive]}>
          🎛️
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
          SETTINGS
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F2EB',
    borderTopWidth: 1.5,
    borderTopColor: '#E2DDD2',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#F8E9B9',
    borderWidth: 1,
    borderColor: '#E6C665',
  },
  tabIcon: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 2,
  },
  tabIconActive: {
    color: '#000000',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: '#171717',
  },
});
