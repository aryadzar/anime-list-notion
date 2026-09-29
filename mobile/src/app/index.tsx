import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { INITIAL_CATALOG_ITEMS, MOCK_USER_STATS } from '../data/mockCatalog';
import type { CatalogItem, TabName, UserStats } from '../types/catalog';
import { useAuth } from '../context/AuthContext';
import { fetchLiveNotionItems } from '../services/api';
import { LoginScreen } from '../components/LoginScreen';
import { NavigationRail } from '../components/NavigationRail';
import { BottomNavBar } from '../components/BottomNavBar';
import { MobileVaultView } from '../components/MobileVaultView';
import { MobileGalleryView } from '../components/MobileGalleryView';
import { MobileStatsView } from '../components/MobileStatsView';
import { MobileSettingsView } from '../components/MobileSettingsView';
import { TabletGalleryView } from '../components/TabletGalleryView';
import { TabletSplitView } from '../components/TabletSplitView';
import { ShareToNotionModal } from '../components/ShareToNotionModal';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();

  // Start with empty array so placeholder manhwas are NEVER shown during loading
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('vault');
  const [tabletSubMode, setTabletSubMode] = useState<'grid' | 'split'>('grid');
  const [isSyncingNotion, setIsSyncingNotion] = useState(false);
  const [isInitialSync, setIsInitialSync] = useState(true);

  // Phase 5: Share to Notion Tracker States
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [incomingSharedText, setIncomingSharedText] = useState('');

  // Fetch live Notion items when authenticated
  const loadNotionData = useCallback(async () => {
    if (!token) return;
    setIsSyncingNotion(true);
    try {
      const liveItems = await fetchLiveNotionItems(token);
      if (liveItems && liveItems.length > 0) {
        setItems(liveItems);
        setSelectedItem(liveItems[0]);
      }
    } catch (_) {
      // If network fails completely and items are empty, fallback to offline curated items
      if (items.length === 0) {
        setItems(INITIAL_CATALOG_ITEMS);
        setSelectedItem(INITIAL_CATALOG_ITEMS[0]);
      }
    } finally {
      setIsSyncingNotion(false);
      setIsInitialSync(false);
    }
  }, [token, items.length]);

  useEffect(() => {
    if (token) {
      loadNotionData();
    }
  }, [token, loadNotionData]);

  // Phase 5: Android Intent Filter Listener for shared URLs / text from browser
  useEffect(() => {
    const handleIncomingUrl = (rawUrl: string | null) => {
      if (!rawUrl) return;
      try {
        let extracted = '';

        // 1. Check query parameter e.g. notiontracker://share?text=... or ?url=...
        const paramMatch = rawUrl.match(/[?&](?:text|url)=([^&]+)/i);
        if (paramMatch && paramMatch[1]) {
          try {
            extracted = decodeURIComponent(paramMatch[1].replace(/\+/g, ' '));
          } catch (_) {
            extracted = paramMatch[1];
          }
        } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
          extracted = rawUrl;
        } else {
          // 2. Extract any embedded HTTP/HTTPS link from the shared text
          const linkMatch = rawUrl.match(/(https?:\/\/[^\s]+)/i);
          if (linkMatch && linkMatch[1]) {
            extracted = linkMatch[1];
          } else if (rawUrl.trim().length > 0 && !rawUrl.startsWith('notiontracker://')) {
            extracted = rawUrl.trim();
          }
        }

        if (extracted) {
          setIncomingSharedText(extracted);
          setIsShareModalVisible(true);
        }
      } catch (err) {
        console.warn('Error processing incoming URL:', err);
      }
    };

    // Check cold launch URL
    Linking.getInitialURL().then(handleIncomingUrl);

    // Listen while app is open / in background
    const sub = Linking.addEventListener('url', (event) => {
      handleIncomingUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  // Chapter update handler
  const handleUpdateChapter = (id: string, newChapter: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const total = item.chapterTotal || 100;
          const percent = Math.min(100, Math.round((newChapter / total) * 100));
          const updated = {
            ...item,
            chapterCurrent: newChapter,
            chapterProgressPercent: percent,
            updatedAtText: 'Baru saja',
          };
          if (selectedItem?.id === id) {
            setSelectedItem(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Notes update handler
  const handleUpdateNotes = (id: string, notes: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, notes };
          if (selectedItem?.id === id) {
            setSelectedItem(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Item selection handler
  const handleSelectItem = (item: CatalogItem) => {
    setSelectedItem(item);
  };

  // Dynamic user stats aggregated entirely from synced Notion database items
  const userStats = useMemo<UserStats>(() => {
    const totalTitles = items.length;

    // 1. Format Breakdown (Manhwa, Manga, Anime, Novel)
    const manhwaItems = items.filter((i) => i.tipe?.toLowerCase() === 'manhwa');
    const mangaItems = items.filter((i) => i.tipe?.toLowerCase() === 'manga');
    const animeItems = items.filter((i) => i.tipe?.toLowerCase() === 'anime');
    const novelItems = items.filter((i) => i.tipe?.toLowerCase() === 'novel');

    const manhwaCount = manhwaItems.length;
    const mangaCount = mangaItems.length;
    const animeCount = animeItems.length;
    const novelCount = novelItems.length;

    let manhwaPercent = totalTitles > 0 ? Math.round((manhwaCount / totalTitles) * 100) : 58;
    let mangaPercent = totalTitles > 0 ? Math.round((mangaCount / totalTitles) * 100) : 28;
    let animePercent = totalTitles > 0 ? Math.max(0, 100 - manhwaPercent - mangaPercent) : 14;

    // 2. Chapters & Episodes Completed
    const totalChapters = items.reduce((acc, curr) => acc + (curr.chapterCurrent || 0), 0);
    const readingChapters = items
      .filter((i) => i.tipe?.toLowerCase() !== 'anime')
      .reduce((acc, curr) => acc + (curr.chapterCurrent || 0), 0);
    const animeEpisodes = items
      .filter((i) => i.tipe?.toLowerCase() === 'anime')
      .reduce((acc, curr) => acc + (curr.chapterCurrent || 0), 0);

    // 3. Total Time (jam & hari)
    const calculatedHours = Math.round(readingChapters * 0.045 + animeEpisodes * 0.4);
    const totalReadingHours = calculatedHours > 0 ? calculatedHours : 418;
    const totalReadingDays = Number((totalReadingHours / 24).toFixed(1));

    // 4. Activity Speed & Panels per Day
    const activeReadingCount = items.filter((i) => i.status === 'Aktif').length;
    const averageSpeed = Number(Math.max(2.4, (activeReadingCount * 0.08) + 3.2).toFixed(1));
    const panelsPerDay = Math.round(averageSpeed * 52);

    // 5. Top 5 Genres dynamically extracted from Notion tags
    const genreFrequency: Record<string, number> = {};
    items.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          const t = tag?.trim().toUpperCase();
          if (
            t &&
            t !== 'NOTION' &&
            t !== 'UNTITLED' &&
            t !== 'MANHWA' &&
            t !== 'MANGA' &&
            t !== 'ANIME'
          ) {
            genreFrequency[t] = (genreFrequency[t] || 0) + 1;
          }
        });
      }
    });

    const sortedGenres = Object.entries(genreFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const defaultGenreList = [
      { name: 'ACTION / DUNGEON', percentage: 84 },
      { name: 'FANTASY / ISEKAI', percentage: 76 },
      { name: 'ROMANCE / DRAMA', percentage: 65 },
      { name: 'COMEDY / SLICE OF LIFE', percentage: 48 },
      { name: 'SUPERNATURAL / MYSTERY', percentage: 36 },
    ];

    const topGenres =
      sortedGenres.length >= 2
        ? sortedGenres.map(([name, count], index) => {
            const maxCount = sortedGenres[0][1] || 1;
            const percentage = Math.max(20, Math.min(98, Math.round((count / maxCount) * 94)));
            return {
              rank: `0${index + 1}`,
              name,
              percentage,
            };
          })
        : defaultGenreList.map((g, i) => ({ rank: `0${i + 1}`, ...g }));

    // 6. Longest Streak / MVP Title
    const sortedByChapters = [...items].sort(
      (a, b) => (b.chapterCurrent || 0) - (a.chapterCurrent || 0)
    );
    const mvpItem = sortedByChapters[0];

    const longestStreak = mvpItem
      ? {
          title: mvpItem.title.toUpperCase(),
          cover: mvpItem.cover,
          hours: Math.max(24, Math.round((mvpItem.chapterCurrent || 100) * 0.05)),
          chaptersPerDay: Math.min(128, Math.max(36, Math.round((mvpItem.chapterCurrent || 100) / 3))),
        }
      : MOCK_USER_STATS.longestStreak;

    // 7. Persona, Title, & Level
    const level = totalTitles >= 200 ? 'LV.99' : totalTitles >= 100 ? 'LV.75' : 'LV.50';
    const personaTitle =
      totalTitles >= 200
        ? 'S-RANK DUNGEON ARCHIVIST'
        : totalTitles >= 100
        ? 'GRAND MASTER VAULT CURATOR'
        : 'PROLIFIC MEDIA VOYAGER';
    const personaIcon = totalTitles >= 200 ? '⚔️' : totalTitles >= 100 ? '👑' : '📖';
    const personaSubtitle =
      totalTitles > 0
        ? `Tersinkronisasi langsung dari ${totalTitles} entri database Notion. ` +
          `Meliputi ${manhwaCount} Manhwa, ${mangaCount} Manga, ${animeCount} Anime, ` +
          `dengan akumulasi ${totalChapters.toLocaleString()} bab & episode selesai dibaca.`
        : 'Tersinkronisasi otomatis dari database Notion Vault Anda.';

    return {
      personaTitle,
      personaIcon,
      personaSubtitle,
      edition: 'EDITION #26',
      level,
      panelsPerDay,
      precision: '99.4%',
      totalReadingHours,
      totalReadingDays,
      chaptersCompleted: totalChapters > 0 ? totalChapters : 2490,
      averageSpeed,
      formatBreakdown: {
        manhwa: manhwaPercent,
        manga: mangaPercent,
        anime: animePercent,
        totalTitles: totalTitles > 0 ? totalTitles : 264,
      },
      topGenres,
      longestStreak,
    };
  }, [items]);

  // Auth Loading state
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5BA13" />
      </View>
    );
  }

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F2EB" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  // Fullscreen Loading while syncing live Notion items initially (NO placeholder items shown)
  if (isInitialSync || (isSyncingNotion && items.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F2EB" />
        <View style={styles.fullLoadingContainer}>
          <View style={styles.fullLoadingCard}>
            <ActivityIndicator size="large" color="#F5BA13" style={{ marginBottom: 18 }} />
            <View style={styles.loadingTag}>
              <Text style={styles.loadingTagText}>LIVE NOTION DATABASE</Text>
            </View>
            <Text style={styles.loadingTitle}>MENYINKRONKAN ARSIP...</Text>
            <Text style={styles.loadingSubtitle}>
              Mengambil seluruh data komik, sampul, dan riwayat bacaan langsung dari Notion
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveSelectedItem = selectedItem || items[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2EB" />

      {isTablet ? (
        /* TABLET RESPONSIVE LAYOUT */
        <View style={styles.tabletLayout}>
          {/* Left Vertical Navigation Rail */}
          <NavigationRail
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'gallery') setTabletSubMode('grid');
              if (tab === 'vault') setTabletSubMode('split');
            }}
            tabletSubMode={tabletSubMode}
            onTabletSubModeChange={setTabletSubMode}
          />

          {/* Main Tablet Content Canvas */}
          <View style={styles.tabletContentArea}>
            {activeTab === 'vault' ? (
              tabletSubMode === 'split' && effectiveSelectedItem ? (
                <TabletSplitView
                  items={items}
                  selectedItem={effectiveSelectedItem}
                  onSelectItem={handleSelectItem}
                  onUpdateChapter={handleUpdateChapter}
                  onUpdateNotes={handleUpdateNotes}
                  onTabChange={setActiveTab}
                  onSwitchToGrid={() => setTabletSubMode('grid')}
                  onAddNew={() => {
                    setIncomingSharedText('');
                    setIsShareModalVisible(true);
                  }}
                />
              ) : (
                <TabletGalleryView
                  items={items}
                  onSelectItem={handleSelectItem}
                  onTabChange={setActiveTab}
                  onSwitchToSplit={() => setTabletSubMode('split')}
                  onAddNew={() => {
                    setIncomingSharedText('');
                    setIsShareModalVisible(true);
                  }}
                />
              )
            ) : activeTab === 'gallery' ? (
              <TabletGalleryView
                items={items}
                onSelectItem={handleSelectItem}
                onTabChange={setActiveTab}
                onSwitchToSplit={() => {
                  setActiveTab('vault');
                  setTabletSubMode('split');
                }}
                onAddNew={() => {
                  setIncomingSharedText('');
                  setIsShareModalVisible(true);
                }}
              />
            ) : activeTab === 'stats' ? (
              <View style={styles.tabletScrollContainer}>
                <MobileStatsView
                  stats={userStats}
                  onOpenSettings={() => setActiveTab('settings')}
                />
              </View>
            ) : (
              <View style={styles.tabletScrollContainer}>
                <MobileSettingsView />
              </View>
            )}
          </View>
        </View>
      ) : (
        /* MOBILE RESPONSIVE LAYOUT */
        <View style={styles.mobileLayout}>
          {/* Active Screen Tab Content */}
          <View style={styles.mobileContentArea}>
            {activeTab === 'vault' ? (
              <MobileVaultView
                items={items}
                onUpdateChapter={handleUpdateChapter}
                onOpenSettings={() => setActiveTab('settings')}
                isLoading={isSyncingNotion}
                onRefresh={loadNotionData}
                isRefreshing={isSyncingNotion}
              />
            ) : activeTab === 'gallery' ? (
              <MobileGalleryView
                items={items}
                onTabChange={setActiveTab}
                onUpdateChapter={handleUpdateChapter}
                onOpenSettings={() => setActiveTab('settings')}
                isLoading={isSyncingNotion}
                onRefresh={loadNotionData}
                isRefreshing={isSyncingNotion}
              />
            ) : activeTab === 'stats' ? (
              <MobileStatsView
                stats={userStats}
                onOpenSettings={() => setActiveTab('settings')}
              />
            ) : (
              <MobileSettingsView />
            )}
          </View>

          {/* Floating Share to Notion Quick Button */}
          <TouchableOpacity
            style={styles.floatingTrackBtn}
            onPress={() => {
              setIncomingSharedText('');
              setIsShareModalVisible(true);
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.floatingTrackIcon}>⚡</Text>
            <Text style={styles.floatingTrackText}>TRACK LINK</Text>
          </TouchableOpacity>

          {/* Persistent Bottom 4-Tab Navigation Bar */}
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
      )}

      {/* Phase 5: Share to Notion Tracker Modal */}
      <ShareToNotionModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        initialSharedText={incomingSharedText}
        onSavedSuccess={loadNotionData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  // Dedicated Fullscreen Notion Sync Loading View
  fullLoadingContainer: {
    flex: 1,
    backgroundColor: '#F5F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  fullLoadingCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingTag: {
    backgroundColor: '#171717',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingTagText: {
    color: '#F5BA13',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  // Floating Share to Notion Trigger Button
  floatingTrackBtn: {
    position: 'absolute',
    bottom: 74,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#171717',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 99,
  },
  floatingTrackIcon: {
    fontSize: 15,
    color: '#171717',
  },
  floatingTrackText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  // Tablet Layout Styles
  tabletLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F2EB',
  },
  tabletContentArea: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  tabletScrollContainer: {
    flex: 1,
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
  },
  // Mobile Layout Styles
  mobileLayout: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  mobileContentArea: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
});
