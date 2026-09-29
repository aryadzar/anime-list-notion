import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TabName } from '../types/catalog';

interface NavigationRailProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  tabletSubMode?: 'split' | 'grid';
  onTabletSubModeChange?: (mode: 'split' | 'grid') => void;
}

export function NavigationRail({
  activeTab,
  onTabChange,
  tabletSubMode = 'grid',
  onTabletSubModeChange,
}: NavigationRailProps) {
  return (
    <View style={styles.rail}>
      {/* Top Logo */}
      <View style={styles.topLogo}>
        <Text style={styles.logoIcon}>📖</Text>
      </View>

      {/* Nav Actions */}
      <View style={styles.navGroup}>
        {/* 1. Vault / Split List */}
        <TouchableOpacity
          onPress={() => {
            onTabChange('vault');
            if (onTabletSubModeChange) onTabletSubModeChange('split');
          }}
          activeOpacity={0.7}
          style={[
            styles.navItem,
            activeTab === 'vault' && styles.navItemActive,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'vault' && styles.navIconActive]}>
            田
          </Text>
        </TouchableOpacity>

        {/* 2. Gallery Poster Board */}
        <TouchableOpacity
          onPress={() => {
            onTabChange('gallery');
            if (onTabletSubModeChange) onTabletSubModeChange('grid');
          }}
          activeOpacity={0.7}
          style={[
            styles.navItem,
            activeTab === 'gallery' && styles.navItemActive,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'gallery' && styles.navIconActive]}>
            ▤
          </Text>
        </TouchableOpacity>

        {/* 3. Stats Wrapped */}
        <TouchableOpacity
          onPress={() => onTabChange('stats')}
          activeOpacity={0.7}
          style={[
            styles.navItem,
            activeTab === 'stats' && styles.navItemActive,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'stats' && styles.navIconActive]}>
            📈
          </Text>
        </TouchableOpacity>

        {/* 4. Settings & Share Target */}
        <TouchableOpacity
          onPress={() => onTabChange('settings')}
          activeOpacity={0.7}
          style={[
            styles.navItem,
            activeTab === 'settings' && styles.navItemActive,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'settings' && styles.navIconActive]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom User Profile */}
      <View style={styles.bottomProfile}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 64,
    backgroundColor: '#F5F2EA',
    borderRightWidth: 1.5,
    borderRightColor: '#171717',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#171717',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#171717',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 20,
  },
  navGroup: {
    gap: 12,
    alignItems: 'center',
  },
  navItem: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#F5BA13',
    borderWidth: 1.5,
    borderColor: '#171717',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  navIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  navIconActive: {
    color: '#000000',
  },
  bottomProfile: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
});
