import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import type { CatalogItem, TabName } from '../types/catalog';
import { getReadOnInfo, openItemLink } from '../utils/sourceLinks';
import { SearchFilterSortBar } from './SearchFilterSortBar';
import { filterAndSortCatalogItems, SortOption } from '../utils/filterSort';

interface MobileGalleryViewProps {
  items: CatalogItem[];
  onTabChange: (tab: TabName) => void;
  onUpdateChapter: (id: string, newChapter: number) => void;
  onOpenSettings?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface GridCardItemProps {
  item: CatalogItem;
  cardWidth: number;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onPress: (item: CatalogItem) => void;
}

/**
 * High-performance memoized card item for 60fps scrolling with 260+ Notion items
 */
const GridCardItem = React.memo(function GridCardItem({
  item,
  cardWidth,
  isBookmarked,
  onToggleBookmark,
  onPress,
}: GridCardItemProps) {
  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: cardWidth }]}
      activeOpacity={0.88}
      onPress={() => onPress(item)}
    >
      {/* Hardware-accelerated cached cover image */}
      <Image
        source={{ uri: item.cover }}
        style={styles.posterImage}
        contentFit="cover"
        transition={100}
        cachePolicy="memory-disk"
        priority="high"
        recyclingKey={item.id}
      />

      {/* Top Badges */}
      <View style={styles.posterTopRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.tipe.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookmarkButton,
            isBookmarked && styles.bookmarkButtonActive,
          ]}
          onPress={() => onToggleBookmark(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.bookmarkIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      {/* Dark Scrim Overlay at bottom */}
      <View style={styles.posterScrim}>
        {/* Status Row */}
        <View style={styles.posterMetaRow}>
          {item.status === 'Aktif' ? (
            <View style={styles.statusActivePill}>
              <Text style={styles.statusDotBlack}>•</Text>
              <Text style={styles.statusActiveText}>AKTIF</Text>
            </View>
          ) : item.status === 'Selesai' ? (
            <View style={styles.statusCompletedPill}>
              <Text style={styles.statusCompletedText}>SELESAI</Text>
            </View>
          ) : (
            <View style={styles.statusPlanPill}>
              <Text style={styles.statusPlanText}>RENCANA</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.posterTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      {/* Active Yellow Accent Line */}
      {item.status === 'Aktif' && <View style={styles.activeYellowLine} />}
    </TouchableOpacity>
  );
});

export function MobileGalleryView({
  items,
  onTabChange,
  onUpdateChapter,
  onOpenSettings,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: MobileGalleryViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const CARD_GAP = 12;
  const PADDING_H = 14;
  // Exact 2-column card width calculation to prevent flex wrap bug
  const cardWidth = Math.floor((windowWidth - PADDING_H * 2 - CARD_GAP) / 2);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set<string>());
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Manhwa: 0,
      Manga: 0,
      Anime: 0,
      Novel: 0,
    };
    items.forEach((i) => {
      if (counts[i.tipe] !== undefined) {
        counts[i.tipe]++;
      }
    });
    return counts;
  }, [items]);

  // Filter & sort items
  const filteredItems = useMemo(() => {
    return filterAndSortCatalogItems(
      items,
      searchQuery,
      selectedType,
      selectedStatus,
      sortBy
    );
  }, [items, searchQuery, selectedType, selectedStatus, sortBy]);

  const totalCount = items.length;
  const readingCount = useMemo(() => items.filter((i) => i.status === 'Aktif').length, [items]);

  // Memoized card renderer
  const renderCardItem = useCallback(
    ({ item }: { item: CatalogItem }) => {
      return (
        <GridCardItem
          item={item}
          cardWidth={cardWidth}
          isBookmarked={bookmarkedIds.has(item.id)}
          onToggleBookmark={toggleBookmark}
          onPress={setSelectedItem}
        />
      );
    },
    [cardWidth, bookmarkedIds, toggleBookmark]
  );

  const keyExtractor = useCallback((item: CatalogItem) => item.id, []);

  // Header of the FlatList
  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeaderContainer}>
        {/* 1. Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerIcon}>📖</Text>
            <Text style={styles.headerTitle}>GALLERY GRID</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.avatarButton} onPress={onOpenSettings}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Controls Row: List / Grid switch */}
        <View style={styles.controlsRow}>
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={styles.toggleBtnInactive}
              onPress={() => onTabChange('vault')}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIconInactive}>☰</Text>
              <Text style={styles.toggleLabelInactive}>LIST</Text>
            </TouchableOpacity>
            <View style={styles.toggleBtnActive}>
              <Text style={styles.toggleIconActive}>⊞</Text>
              <Text style={styles.toggleLabelActive}>GRID</Text>
            </View>
          </View>
        </View>

        {/* 3. Search, Filter & Sort Bar */}
        <SearchFilterSortBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalFilteredCount={filteredItems.length}
          totalAllCount={items.length}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          typeCounts={typeCounts}
        />

        {/* 4. Live Sync Subheader / Prominent Loading Indicator */}
        {isLoading && (
          <View style={styles.syncLoadingBanner}>
            <ActivityIndicator size="small" color="#171717" />
            <View style={styles.syncLoadingTextCol}>
              <Text style={styles.syncLoadingTitle}>MEMUAT DATABASE NOTION...</Text>
              <Text style={styles.syncLoadingSubtitle}>
                Mengambil 260+ arsip komik & anime live dari cloud
              </Text>
            </View>
          </View>
        )}
      </View>
    ),
    [
      filteredItems.length,
      items.length,
      searchQuery,
      selectedType,
      selectedStatus,
      sortBy,
      isRefreshing,
      isLoading,
      onOpenSettings,
      onTabChange,
      onRefresh,
      typeCounts,
    ]
  );

  // Footer of the FlatList
  const ListFooter = useMemo(
    () => (
      <View style={styles.listFooterContainer}>
        {/* Reading This Week Banner Widget */}
        <View style={styles.weeklyBanner}>
          <View style={styles.weeklyIconBox}>
            <Text style={styles.weeklyFlameIcon}>🔥</Text>
          </View>
          <View style={styles.weeklyContent}>
            <Text style={styles.weeklySubtitle}>SEDANG DIBACA</Text>
            <Text style={styles.weeklyTitle}>
              {readingCount > 0 ? `${readingCount} Judul Aktif` : 'Arsip Terkini'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.weeklyButton}
            onPress={() => onTabChange('stats')}
            activeOpacity={0.8}
          >
            <Text style={styles.weeklyButtonText}>STATISTIK</Text>
          </TouchableOpacity>
        </View>

        {/* Footer archive note */}
        <View style={styles.footerArchive}>
          <Text style={styles.footerDots}>• • •</Text>
          <Text style={styles.footerText}>
            {totalCount > 0
              ? `TOTAL ${totalCount} ENTRI TERARSIPKAN DI NOTION`
              : 'MEMUAT KOLEKSI ARSIP LAINNYA'}
          </Text>
        </View>
      </View>
    ),
    [totalCount, onTabChange]
  );

  // Empty state rendering
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#F5BA13" style={{ marginBottom: 14 }} />
          <Text style={styles.emptyTitle}>MEMUAT ARSIP NOTION...</Text>
          <Text style={styles.emptySubtitle}>
            Sedang mengunduh dan menyinkronkan data katalog...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>TIDAK ADA ENTRI YANG COCOK</Text>
        <Text style={styles.emptySubtitle}>
          Tidak ditemukan komik atau anime yang sesuai dengan kriteria filter atau pencarian Anda.
        </Text>
        <TouchableOpacity
          style={styles.emptyResetBtn}
          onPress={() => {
            setSearchQuery('');
            setSelectedType('all');
            setSelectedStatus('all');
            setSortBy('default');
          }}
        >
          <Text style={styles.emptyResetText}>Reset Semua Filter</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 60 FPS Virtualized 2-Column Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.gridColumnWrapper}
        contentContainerStyle={styles.flatListContent}
        renderItem={renderCardItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setSelectedItem(null)}
            />
            <View style={styles.bottomSheetContainer}>
              <View style={styles.dragHandle} />

              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleGroup}>
                  <Text style={styles.sheetHeaderIcon}>⤢</Text>
                  <Text style={styles.sheetTitle}>DETAIL ENTRI DATABASE</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  style={styles.sheetCloseBtn}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetBody}>
                <View style={styles.sheetTopRow}>
                  <Image
                    source={{ uri: selectedItem.cover }}
                    style={styles.sheetCover}
                    contentFit="cover"
                  />
                  <View style={styles.sheetDetails}>
                    <View style={styles.sheetBadgesRow}>
                      <View style={styles.sheetTypeBadge}>
                        <Text style={styles.sheetTypeBadgeText}>
                          {selectedItem.tipe.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.sheetStatusBadge}>
                        <Text style={styles.sheetStatusBadgeText}>
                          {selectedItem.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.sheetItemTitle}>{selectedItem.title}</Text>
                    <Text style={styles.sheetAuthor}>
                      Dibuat oleh <Text style={styles.boldText}>arya</Text>
                    </Text>
                    <Text style={styles.sheetDate}>
                      📅 {selectedItem.dateAdded || '24 Okt 2024 · 14:32'}
                    </Text>
                  </View>
                </View>

                {/* Genre / Tags Section */}
                <View style={styles.genreBox}>
                  <Text style={styles.gridLabel}>GENRE / TAGS</Text>
                  <View style={styles.genreRow}>
                    {selectedItem.tags && selectedItem.tags.length > 0 ? (
                      selectedItem.tags.map((tag, idx) => (
                        <View key={idx} style={styles.genreChip}>
                          <Text style={styles.genreChipText}>
                            {typeof tag === 'string' ? tag : (tag as any).name || ''}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyGenreText}>Tidak ada genre terdaftar</Text>
                    )}
                  </View>
                </View>


                {/* Primary Action Button */}
                <View style={styles.sheetActionRow}>
                  <TouchableOpacity
                    style={styles.readWebtoonBtn}
                    onPress={() => openItemLink(selectedItem)}
                  >
                    <Text style={styles.readWebtoonBtnText}>
                      {getReadOnInfo(selectedItem).label}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sheetShareBtn}>
                    <Text style={styles.sheetShareIcon}>🔗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  listHeaderContainer: {
    backgroundColor: '#F5F2EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#F5F2EB',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  searchIcon: {
    fontSize: 18,
  },
  avatarButton: {
    padding: 2,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1B1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    overflow: 'hidden',
  },
  toggleBtnInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  toggleIconInactive: {
    fontSize: 12,
    color: '#666666',
  },
  toggleLabelInactive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
  },
  toggleBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: '#171717',
    borderRadius: 4,
  },
  toggleIconActive: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  toggleLabelActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 6,
  },
  sortIcon: {
    fontSize: 13,
    color: '#171717',
  },
  sortText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  sortArrow: {
    fontSize: 11,
    color: '#171717',
    fontWeight: 'bold',
  },
  filterScrollContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDD2',
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#EAE6DC',
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  filterPillActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  syncRow: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C7971',
    letterSpacing: 1.1,
  },
  syncLoadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    marginHorizontal: 14,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
    gap: 12,
  },
  syncLoadingTextCol: {
    flex: 1,
  },
  syncLoadingTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  syncLoadingSubtitle: {
    fontSize: 10,
    color: '#333333',
    fontWeight: '600',
  },
  // 2-Column Grid
  flatListContent: {
    paddingBottom: 28,
  },
  gridColumnWrapper: {
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  gridCard: {
    aspectRatio: 0.68,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#171717',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  typeBadge: {
    backgroundColor: 'rgba(23, 23, 23, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#383838',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  bookmarkButton: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: 'rgba(238, 235, 227, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#171717',
  },
  bookmarkButtonActive: {
    backgroundColor: '#F5BA13',
  },
  bookmarkIcon: {
    fontSize: 12,
  },
  posterScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(10, 10, 10, 0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  posterMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 4,
  },
  statusDotBlack: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '900',
  },
  statusActiveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  statusCompletedPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusCompletedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  statusPlanPill: {
    backgroundColor: '#DCE9F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusPlanText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1C4A70',
    letterSpacing: 0.5,
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E5E5E5',
  },
  posterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  activeYellowLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '45%',
    height: 3,
    backgroundColor: '#F5BA13',
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Footer
  listFooterContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  weeklyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 12,
  },
  weeklyIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#171717',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyFlameIcon: {
    fontSize: 18,
  },
  weeklyContent: {
    flex: 1,
  },
  weeklySubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#737373',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
  },
  weeklyButton: {
    backgroundColor: '#171717',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  weeklyButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  footerArchive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    gap: 6,
  },
  footerDots: {
    fontSize: 14,
    color: '#9E9A8F',
    letterSpacing: 4,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C7971',
    letterSpacing: 1.2,
  },
  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#F5F2EB',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#171717',
    maxHeight: '85%',
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#C5C0B3',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDD2',
  },
  sheetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetHeaderIcon: {
    fontSize: 14,
    color: '#555555',
  },
  sheetTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: 0.8,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetCloseText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  sheetBody: {
    paddingTop: 14,
  },
  sheetTopRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  sheetCover: {
    width: 80,
    height: 112,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
  },
  sheetDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  sheetBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  sheetTypeBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sheetTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  sheetStatusBadge: {
    backgroundColor: '#E5E1D6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sheetStatusBadgeText: {
    color: '#333333',
    fontSize: 9,
    fontWeight: '800',
  },
  sheetItemTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 4,
  },
  sheetAuthor: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#171717',
  },
  sheetDate: {
    fontSize: 11,
    color: '#777777',
  },
  genreBox: {
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  genreChip: {
    backgroundColor: '#DFDAD0',
    borderWidth: 1,
    borderColor: '#CCC6B8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genreChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#171717',
  },
  emptyGenreText: {
    fontSize: 11,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  sheetGridBox: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  sheetGridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#171717',
  },
  progressStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  progressTextCol: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
  },
  stepperActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#D8D3C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPlus: {
    backgroundColor: '#171717',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#171717',
  },
  stepperBtnPlusText: {
    color: '#FFFFFF',
  },
  sheetActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  readWebtoonBtn: {
    flex: 1,
    backgroundColor: '#171717',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readWebtoonBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  sheetShareBtn: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#EAE6DC',
    borderWidth: 1,
    borderColor: '#D8D3C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetShareIcon: {
    fontSize: 16,
  },
  emptyResetBtn: {
    marginTop: 14,
    backgroundColor: '#171717',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyResetText: {
    color: '#F5BA13',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
