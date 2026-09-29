import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import type { CatalogItem, TabName } from '../types/catalog';
import { getReadOnInfo, openItemLink } from '../utils/sourceLinks';

interface TabletGalleryViewProps {
  items: CatalogItem[];
  onSelectItem: (item: CatalogItem) => void;
  onTabChange: (tab: TabName) => void;
  onSwitchToSplit?: () => void;
  onAddNew?: () => void;
}

export function TabletGalleryView({
  items,
  onSelectItem,
  onTabChange,
  onSwitchToSplit,
  onAddNew,
}: TabletGalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('SEMUA');
  const [columnCount, setColumnCount] = useState<3 | 4>(4);

  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const match =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }
    if (selectedCategory !== 'SEMUA') {
      if (item.tipe.toUpperCase() !== selectedCategory) return false;
    }
    if (selectedStatusFilter !== 'SEMUA') {
      const s = selectedStatusFilter.toUpperCase();
      const itemStatus = (item.status || '').toLowerCase();
      const rawStatus = (item.rawStatus || '').toLowerCase();

      if (s === 'AKTIF') {
        if (itemStatus !== 'aktif' && !rawStatus.includes('reading')) return false;
      } else if (s === 'SELESAI') {
        if (itemStatus !== 'selesai' && !rawStatus.includes('completed')) return false;
      } else if (s === 'RENCANA') {
        if (itemStatus !== 'rencana' && !rawStatus.includes('plan')) return false;
      } else if (s === 'ON_HOLD') {
        if (itemStatus !== 'on hold' && !rawStatus.includes('hold')) return false;
      }
    }
    return true;
  });

  const manhwaCount = items.filter((i) => i.tipe === 'Manhwa').length;
  const mangaCount = items.filter((i) => i.tipe === 'Manga').length;
  const animeCount = items.filter((i) => i.tipe === 'Anime').length;
  const novelCount = items.filter((i) => i.tipe === 'Novel').length;

  const readingCount = items.filter(
    (i) => i.status === 'Aktif' || i.rawStatus?.toLowerCase().includes('reading')
  ).length;
  const finishedCount = items.filter(
    (i) => i.status === 'Selesai' || i.rawStatus?.toLowerCase().includes('completed')
  ).length;
  const planCount = items.filter(
    (i) => i.status === 'Rencana' || i.rawStatus?.toLowerCase().includes('plan')
  ).length;
  const holdCount = items.filter(
    (i) => i.status === 'On Hold' || i.rawStatus?.toLowerCase().includes('hold')
  ).length;

  return (
    <View style={styles.container}>
      {/* 1. Top Search & Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Cari koleksi..."
            placeholderTextColor="#888888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.syncBadge}>
          <Text style={styles.syncDot}>•</Text>
          <Text style={styles.syncBadgeText}>TERSINKRON KE NOTION</Text>
        </View>

        <View style={styles.viewModeSwitcher}>
          <View style={styles.viewModeActive}>
            <Text style={styles.viewModeActiveText}>⊞</Text>
          </View>
          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={onSwitchToSplit}
            activeOpacity={0.7}
          >
            <Text style={styles.viewModeText}>▤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={onSwitchToSplit}
            activeOpacity={0.7}
          >
            <Text style={styles.viewModeText}>≣</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userChip}>
          <View style={styles.userTextCol}>
            <Text style={styles.userName}>READER VAULT</Text>
            <Text style={styles.userSync}>Notion Synced</Text>
          </View>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>
      </View>

      {/* 2. Title & Control Header Row */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <View style={styles.bookIconBox}>
            <Text style={styles.bookIconText}>📖</Text>
          </View>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.mainTitle}>VAULT POSTER BOARD</Text>
              <View style={styles.tabletBadge}>
                <Text style={styles.tabletBadgeText}>TABLET VIEW</Text>
              </View>
            </View>
            <Text style={styles.dbIdText}>Notion Database ID: db_manga_vault_2026</Text>
          </View>
        </View>

        <View style={styles.titleControlsRight}>
          <View style={styles.columnSwitcher}>
            <TouchableOpacity
              style={[styles.colBtn, columnCount === 4 && styles.colBtnActive]}
              onPress={() => setColumnCount(4)}
              activeOpacity={0.8}
            >
              <Text style={[styles.colBtnText, columnCount === 4 && styles.colBtnTextActive]}>
                田 4 Kolom
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.colBtn, columnCount === 3 && styles.colBtnActive]}
              onPress={() => setColumnCount(3)}
              activeOpacity={0.8}
            >
              <Text style={[styles.colBtnText, columnCount === 3 && styles.colBtnTextActive]}>
                ⊞ 3 Kolom
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sortDropdownBtn}>
            <Text style={styles.sortIcon}>⇅</Text>
            <Text style={styles.sortDropdownText}>TERBARU DIUPDATE</Text>
            <Text style={styles.sortArrow}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddNew || (() => Alert.alert('Tambah Judul', 'Buka dialog tambah judul Notion'))}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ TAMBAH JUDUL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Category Bar */}
      <View style={styles.filterRow}>
        <View style={styles.filterLeftGroup}>
          <TouchableOpacity
            style={[styles.catPill, selectedCategory === 'SEMUA' && styles.catPillActive]}
            onPress={() => setSelectedCategory('SEMUA')}
          >
            <Text style={[styles.catPillText, selectedCategory === 'SEMUA' && styles.catPillTextActive]}>
              SEMUA ({items.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.catPill, selectedCategory === 'MANHWA' && styles.catPillActive]}
            onPress={() => setSelectedCategory('MANHWA')}
          >
            <Text style={[styles.catPillText, selectedCategory === 'MANHWA' && styles.catPillTextActive]}>
              MANHWA ({manhwaCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.catPill, selectedCategory === 'MANGA' && styles.catPillActive]}
            onPress={() => setSelectedCategory('MANGA')}
          >
            <Text style={[styles.catPillText, selectedCategory === 'MANGA' && styles.catPillTextActive]}>
              MANGA ({mangaCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.catPill, selectedCategory === 'ANIME' && styles.catPillActive]}
            onPress={() => setSelectedCategory('ANIME')}
          >
            <Text style={[styles.catPillText, selectedCategory === 'ANIME' && styles.catPillTextActive]}>
              ANIME ({animeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.catPill, selectedCategory === 'NOVEL' && styles.catPillActive]}
            onPress={() => setSelectedCategory('NOVEL')}
          >
            <Text style={[styles.catPillText, selectedCategory === 'NOVEL' && styles.catPillTextActive]}>
              NOVEL ({novelCount})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalChapterBadge}>
          <Text style={styles.totalChapterLabel}>TOTAL KOLEKSI:</Text>
          <Text style={styles.totalChapterValue}>{items.length}</Text>
        </View>
      </View>

      {/* 3b. Dedicated Tablet Status Filter Bar */}
      <View style={styles.statusFilterBar}>
        <View style={styles.statusFilterLabelGroup}>
          <Text style={styles.statusFilterSectionLabel}>FILTER STATUS:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScrollRow}>
          <TouchableOpacity
            style={[styles.statusPillBtn, selectedStatusFilter === 'SEMUA' && styles.statusPillBtnActive]}
            onPress={() => setSelectedStatusFilter('SEMUA')}
          >
            <Text style={[styles.statusPillBtnText, selectedStatusFilter === 'SEMUA' && styles.statusPillBtnTextActive]}>
              Semua Status ({items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusPillBtn, selectedStatusFilter === 'AKTIF' && styles.statusPillBtnActiveBlue]}
            onPress={() => setSelectedStatusFilter('AKTIF')}
          >
            <Text style={styles.blueDot}>•</Text>
            <Text style={[styles.statusPillBtnText, selectedStatusFilter === 'AKTIF' && styles.statusPillBtnTextActiveBlue]}>
              Sedang Dibaca ({readingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusPillBtn, selectedStatusFilter === 'SELESAI' && styles.statusPillBtnActiveGreen]}
            onPress={() => setSelectedStatusFilter('SELESAI')}
          >
            <Text style={styles.greenCheck}>✓</Text>
            <Text style={[styles.statusPillBtnText, selectedStatusFilter === 'SELESAI' && styles.statusPillBtnTextActiveGreen]}>
              Selesai ({finishedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusPillBtn, selectedStatusFilter === 'RENCANA' && styles.statusPillBtnActiveOrange]}
            onPress={() => setSelectedStatusFilter('RENCANA')}
          >
            <Text style={styles.orangeCircle}>○</Text>
            <Text style={[styles.statusPillBtnText, selectedStatusFilter === 'RENCANA' && styles.statusPillBtnTextActiveOrange]}>
              Rencana ({planCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusPillBtn, selectedStatusFilter === 'ON_HOLD' && styles.statusPillBtnActiveGray]}
            onPress={() => setSelectedStatusFilter('ON_HOLD')}
          >
            <Text style={styles.grayHold}>⏸</Text>
            <Text style={[styles.statusPillBtnText, selectedStatusFilter === 'ON_HOLD' && styles.statusPillBtnTextActiveGray]}>
              On Hold ({holdCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. Adaptive Poster Board Grid */}
      <ScrollView
        style={styles.gridScrollView}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {filteredItems.map((item) => {
            const cardBasis = columnCount === 4 ? '23.8%' : '31.8%';

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.posterCard, { width: cardBasis }]}
                activeOpacity={0.9}
                onPress={() => {
                  onSelectItem(item);
                  if (onSwitchToSplit) onSwitchToSplit();
                }}
              >
                {/* Top Badges Header */}
                <View style={styles.cardTopHeader}>
                  <View style={styles.cardTopLeftBadges}>
                    <View
                      style={[
                        styles.itemTypeBadge,
                        item.tipe === 'Manga' && styles.itemTypeBadgeManga,
                      ]}
                    >
                      <Text style={styles.itemTypeText}>{item.tipe.toUpperCase()}</Text>
                    </View>

                    {item.status === 'Aktif' ? (
                      <View style={styles.itemStatusPillActive}>
                        <Text style={styles.itemStatusDot}>•</Text>
                        <Text style={styles.itemStatusTextActive}>AKTIF</Text>
                      </View>
                    ) : item.status === 'Selesai' ? (
                      <View style={styles.itemStatusPillDone}>
                        <Text style={styles.itemStatusDoneIcon}>✓</Text>
                        <Text style={styles.itemStatusTextDone}>SELESAI</Text>
                      </View>
                    ) : item.status === 'On Hold' ? (
                      <View style={styles.itemStatusPillHold}>
                        <Text style={styles.itemStatusTextHold}>⏸ ON HOLD</Text>
                      </View>
                    ) : (
                      <View style={styles.itemStatusPillPlan}>
                        <Text style={styles.itemStatusTextPlan}>○ RENCANA</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Poster Cover */}
                <View style={styles.coverWrapper}>
                  <Image
                    source={{ uri: item.cover }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Details Footer */}
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardAuthor} numberOfLines={1}>
                    {item.author || `Ditambahkan: ${item.dateAdded || 'Sept 26, 2026'}`}
                  </Text>

                  {/* Tags */}
                  <View style={styles.cardTagsRow}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Source Link Footer */}
                  <TouchableOpacity
                    style={styles.cardSourceFooter}
                    onPress={() => openItemLink(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sourceText}>{getReadOnInfo(item).platform}</Text>
                    <Text style={styles.sourceArrow}>➔</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 6. Bottom Notion Tips & Sync Bar */}
      <View style={styles.tipsBottomBar}>
        <View style={styles.tipLeft}>
          <View style={styles.bulbCircle}>
            <Text style={styles.bulbIcon}>💡</Text>
          </View>
          <Text style={styles.tipText}>
            <Text style={styles.tipTextBold}>TIPS TAMPILAN TABLET NOTION: </Text>
            Tap salah satu kartu poster di atas untuk membuka modal inspeksi penuh dengan link cepat
            ke Mangago & Webtoon.
          </Text>
        </View>

        <View style={styles.tipRight}>
          <Text style={styles.syncTimeText}>SYNC: 1 Menit lalu</Text>
          <TouchableOpacity
            style={styles.syncNowBtn}
            onPress={() => Alert.alert('Sinkronisasi', 'Sinkronisasi dengan database Notion sukses!')}
            activeOpacity={0.7}
          >
            <Text style={styles.syncNowBtnText}>SINKRON SEKARANG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#171717',
    backgroundColor: '#F5F2EB',
    gap: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
    color: '#666666',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#171717',
    padding: 0,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 6,
  },
  syncDot: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
    overflow: 'hidden',
  },
  viewModeActive: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#171717',
  },
  viewModeActiveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#171717',
  },
  viewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#171717',
  },
  viewModeText: {
    fontSize: 14,
    color: '#555555',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userTextCol: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
  },
  userSync: {
    fontSize: 9,
    color: '#666666',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 14,
  },
  // Title Row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconBox: {
    width: 42,
    height: 42,
    backgroundColor: '#171717',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIconText: {
    fontSize: 20,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  tabletBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tabletBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dbIdText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  titleControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  columnSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    overflow: 'hidden',
  },
  colBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  colBtnActive: {
    backgroundColor: '#171717',
  },
  colBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555555',
  },
  colBtnTextActive: {
    color: '#FFFFFF',
  },
  sortDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 6,
  },
  sortIcon: {
    fontSize: 12,
    color: '#171717',
  },
  sortDropdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  sortArrow: {
    fontSize: 11,
    color: '#171717',
  },
  addBtn: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  // Filter Bar
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  catPill: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  catPillActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#D8D3C5',
    marginHorizontal: 4,
  },
  // Dedicated Status Filter Bar
  statusFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 10,
  },
  statusFilterLabelGroup: {
    paddingRight: 4,
  },
  statusFilterSectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#777777',
    letterSpacing: 0.8,
  },
  statusScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D8D3C5',
    gap: 6,
  },
  statusPillBtnActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  statusPillBtnActiveBlue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  statusPillBtnActiveGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  statusPillBtnActiveOrange: {
    backgroundColor: '#FFEDD5',
    borderColor: '#EA580C',
  },
  statusPillBtnActiveGray: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6B7280',
  },
  statusPillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#444444',
  },
  statusPillBtnTextActive: {
    color: '#FFFFFF',
  },
  statusPillBtnTextActiveBlue: {
    color: '#1E40AF',
  },
  statusPillBtnTextActiveGreen: {
    color: '#15803D',
  },
  statusPillBtnTextActiveOrange: {
    color: '#C2410C',
  },
  statusPillBtnTextActiveGray: {
    color: '#374151',
  },
  blueDot: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  greenCheck: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  orangeCircle: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: 'bold',
  },
  grayHold: {
    fontSize: 10,
    color: '#4B5563',
  },
  totalChapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#171717',
    gap: 6,
  },
  totalChapterLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  totalChapterValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
  },
  // Grid Scroll
  gridScrollView: {
    flex: 1,
  },
  gridScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  posterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDD2',
  },
  cardTopLeftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTypeBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  itemTypeBadgeManga: {
    backgroundColor: '#2563EB',
  },
  itemTypeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  itemStatusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 3,
  },
  itemStatusDot: {
    fontSize: 8,
    color: '#000000',
    fontWeight: 'bold',
  },
  itemStatusTextActive: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
  },
  itemStatusPillDone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 3,
  },
  itemStatusDoneIcon: {
    fontSize: 8,
    color: '#171717',
    fontWeight: 'bold',
  },
  itemStatusTextDone: {
    fontSize: 8,
    fontWeight: '900',
    color: '#171717',
  },
  itemStatusPillHold: {
    backgroundColor: '#FED7AA',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  itemStatusTextHold: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9A3412',
  },
  itemStatusPillPlan: {
    backgroundColor: '#E0EEFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  itemStatusTextPlan: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1E40AF',
  },
  cardBookmarkBtn: {
    padding: 2,
  },
  bookmarkIcon: {
    fontSize: 12,
    opacity: 0.4,
  },
  bookmarkIconActive: {
    opacity: 1,
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#171717',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  progressStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(238, 235, 227, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#171717',
  },
  progressStripLeft: {
    fontSize: 8,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  progressStripRight: {
    fontSize: 8,
    fontWeight: '900',
    color: '#555555',
  },
  progressRightRed: {
    color: '#DC2626',
  },
  cardDetails: {
    padding: 10,
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
  },
  cardAuthor: {
    fontSize: 10,
    color: '#666666',
  },
  cardTagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  tagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#444444',
  },
  cardSourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
    paddingTop: 6,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.6,
  },
  sourceArrow: {
    fontSize: 10,
    color: '#666666',
  },
  // Floating Reading Target Banner
  readingTargetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    padding: 12,
    marginTop: 18,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  percentBadge: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#171717',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
  },
  targetProgressCol: {
    flex: 1,
    gap: 6,
  },
  targetLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  targetGoalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EAE6DC',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 4,
  },
  wrappedBtn: {
    backgroundColor: '#171717',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
  },
  wrappedBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  // Bottom Tip Bar
  tipsBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAE6DC',
    borderTopWidth: 1.5,
    borderTopColor: '#171717',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bulbCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulbIcon: {
    fontSize: 14,
  },
  tipText: {
    fontSize: 11,
    color: '#444444',
    flex: 1,
  },
  tipTextBold: {
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  tipRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncTimeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  syncNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#171717',
  },
  syncNowBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
});
