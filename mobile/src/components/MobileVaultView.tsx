import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import type { CatalogItem, MediaType } from '../types/catalog';
import { getReadOnInfo, openItemLink } from '../utils/sourceLinks';
import { SearchFilterSortBar } from './SearchFilterSortBar';
import { filterAndSortCatalogItems, SortOption } from '../utils/filterSort';

interface MobileVaultViewProps {
  items: CatalogItem[];
  onUpdateChapter: (id: string, newChapter: number) => void;
  onOpenSettings?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MobileVaultView({
  items,
  onUpdateChapter,
  onOpenSettings,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: MobileVaultViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

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

  const filteredItems = useMemo(() => {
    return filterAndSortCatalogItems(
      items,
      searchQuery,
      selectedType,
      selectedStatus,
      sortBy
    );
  }, [items, searchQuery, selectedType, selectedStatus, sortBy]);

  const ListHeader = (
    <View>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerIcon}>📖</Text>
          <Text style={styles.headerTitle}>VAULT COLLECTION</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.avatarButton} onPress={onOpenSettings}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Interactive Search, Filter & Sort Component */}
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

      {isLoading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 }}>
          <ActivityIndicator size="small" color="#F5BA13" />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#171717', letterSpacing: 0.8 }}>
            MENYINKRONKAN DATABASE NOTION...
          </Text>
        </View>
      )}
    </View>
  );

  const renderCompactItem = ({ item }: { item: CatalogItem }) => {
    const isCompleted = item.status === 'Selesai';
    const isPlan = item.status === 'Rencana';

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.cardItem}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrapper}>
          <Image
            source={{ uri: item.cover }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>

        {/* Middle Info */}
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.tipe.toUpperCase()}</Text>
            </View>
            <Text
              style={[
                styles.statusDotText,
                isCompleted
                  ? styles.statusCompleted
                  : isPlan
                  ? styles.statusPlan
                  : styles.statusAktif,
              ]}
            >
              {isCompleted ? 'SELESAI' : isPlan ? '○ Rencana' : '• Aktif'}
            </Text>
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.publisher || item.author || (isCompleted ? 'Status Tamat' : 'Status Berjalan')}
          </Text>
        </View>

        {/* Right Status Chevron */}
        <View style={styles.cardRight}>
          <Text style={styles.chevronIcon}>{isCompleted ? '✓' : '›'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCompactItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.itemListContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Tidak Ada Judul yang Cocok</Text>
              <Text style={styles.emptySubtitle}>
                Coba ubah kata kunci pencarian atau reset filter untuk menampilkan koleksi lainnya.
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
          ) : null
        }
      />

      {/* 5. Detail Bottom Sheet Modal (Image-6 Bottom Half) */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <TouchableOpacity
            style={styles.bottomSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleBar} />

            {selectedItem && (
              <>
                {/* Sheet Header */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>⤢ DETAIL ENTRI DATABASE</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Hero Item Row */}
                <View style={styles.heroRow}>
                  <Image source={{ uri: selectedItem.cover }} style={styles.sheetCover} />
                  <View style={styles.heroDetails}>
                    <View style={styles.heroBadges}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {selectedItem.tipe.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.sheetStatusPill}>
                        <Text style={styles.sheetStatusText}>
                          {selectedItem.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.sheetItemTitle}>{selectedItem.title}</Text>
                    <Text style={styles.sheetAuthor}>
                      Dibuat oleh <Text style={styles.boldText}>arya</Text>
                    </Text>
                    <Text style={styles.sheetDate}>📅 {selectedItem.dateAdded}</Text>
                  </View>
                </View>

                {/* Genre / Tags Section */}
                <View style={styles.genreBox}>
                  <Text style={styles.propLabel}>GENRE / TAGS</Text>
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


                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.readBtn}
                    onPress={() => openItemLink(selectedItem)}
                  >
                    <Text style={styles.readBtnText}>
                      {getReadOnInfo(selectedItem).label}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareBtn}>
                    <Text style={styles.shareBtnIcon}>🔗</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F5F2EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E1D5',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  subControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subControlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  koleksiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
  },
  koleksiIcon: {
    fontSize: 12,
  },
  koleksiText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE6DA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  syncDot: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
  subControlRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EBE6DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 14,
    color: '#171717',
    fontWeight: 'bold',
  },
  filterScrollContainer: {
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EBE6DA',
  },
  filterPillActive: {
    backgroundColor: '#171717',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  itemList: {
    flex: 1,
  },
  itemListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2DDD2',
  },
  thumbWrapper: {
    width: 48,
    height: 58,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#171717',
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rawBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  rawText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDotText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusAktif: {
    color: '#D97706',
  },
  statusCompleted: {
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  statusPlan: {
    color: '#4F46E5',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#171717',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  chapterPill: {
    backgroundColor: '#E2DDD2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chapterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#171717',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#F5F2EB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#E2DDD2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D1CBBF',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#EBE6DA',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  sheetCover: {
    width: 72,
    height: 96,
    borderRadius: 6,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#DED9CC',
  },
  heroDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sheetStatusPill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sheetStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#374151',
  },
  sheetItemTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 4,
  },
  sheetAuthor: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#171717',
  },
  sheetDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  genreBox: {
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2DDD2',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  genreChip: {
    backgroundColor: '#E2DDD2',
    borderWidth: 1,
    borderColor: '#D5CDC0',
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
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  propGrid: {
    flexDirection: 'row',
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2DDD2',
  },
  propCol: {
    flex: 1,
  },
  propLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 3,
  },
  propValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#171717',
  },
  progressBox: {
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2DDD2',
  },
  progressBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
  },
  progressCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
  },
  counterBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  counterBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#E2DDD2',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#171717',
  },
  counterBtnPlus: {
    backgroundColor: '#171717',
  },
  counterBtnPlusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  readBtn: {
    flex: 1,
    backgroundColor: '#171717',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  shareBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#EFECE4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2DDD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnIcon: {
    fontSize: 16,
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyResetBtn: {
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
