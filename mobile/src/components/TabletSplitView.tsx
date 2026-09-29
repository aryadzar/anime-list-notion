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
  Linking,
} from 'react-native';
import type { CatalogItem, TabName } from '../types/catalog';
import { getReadOnInfo, openItemLink } from '../utils/sourceLinks';

interface TabletSplitViewProps {
  items: CatalogItem[];
  selectedItem: CatalogItem;
  onSelectItem: (item: CatalogItem) => void;
  onUpdateChapter?: (id: string, newChapter: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onTabChange: (tab: TabName) => void;
  onSwitchToGrid?: () => void;
  onAddNew?: () => void;
}

export function TabletSplitView({
  items,
  selectedItem,
  onSelectItem,
  onUpdateChapter,
  onUpdateNotes,
  onTabChange,
  onSwitchToGrid,
  onAddNew,
}: TabletSplitViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('SEMUA');
  const [notesText, setNotesText] = useState(selectedItem.notes || '');

  // Keep notes updated when selectedItem changes
  React.useEffect(() => {
    setNotesText(selectedItem.notes || '');
  }, [selectedItem.id]);

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
      const s = selectedStatusFilter.toLowerCase();
      const itemStatus = (item.status || '').toLowerCase();
      const rawStatus = (item.rawStatus || '').toLowerCase();

      if (s === 'aktif') {
        if (itemStatus !== 'aktif' && !rawStatus.includes('reading')) return false;
      } else if (s === 'selesai') {
        if (itemStatus !== 'selesai' && !rawStatus.includes('completed')) return false;
      } else if (s === 'rencana') {
        if (itemStatus !== 'rencana' && !rawStatus.includes('plan')) return false;
      } else if (s === 'on hold') {
        if (itemStatus !== 'on hold' && !rawStatus.includes('hold')) return false;
      }
    }
    return true;
  });

  const manhwaCount = items.filter((i) => i.tipe === 'Manhwa').length;
  const mangaCount = items.filter((i) => i.tipe === 'Manga').length;
  const animeCount = items.filter((i) => i.tipe === 'Anime').length;
  const novelCount = items.filter((i) => i.tipe === 'Novel').length;

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
          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={onSwitchToGrid}
            activeOpacity={0.7}
          >
            <Text style={styles.viewModeText}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={onSwitchToGrid}
            activeOpacity={0.7}
          >
            <Text style={styles.viewModeText}>▤</Text>
          </TouchableOpacity>
          <View style={styles.viewModeActive}>
            <Text style={styles.viewModeActiveText}>≣</Text>
          </View>
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

      {/* 2. Split Master-Detail Container */}
      <View style={styles.splitContainer}>
        {/* Left Column: Master List (VAULT INDEX) */}
        <View style={styles.masterColumn}>
          {/* Index Header */}
          <View style={styles.indexHeader}>
            <View style={styles.indexTitleRow}>
              <View style={styles.indexYellowIconBox} />
              <Text style={styles.indexTitle}>VAULT INDEX</Text>
            </View>
            <View style={styles.syncedItemsBadge}>
              <Text style={styles.syncedItemsText}>{items.length} Items Synced</Text>
            </View>
          </View>

          {/* Filter Categories Tabs */}
          <View style={styles.indexCategoryTabs}>
            <TouchableOpacity
              style={[styles.indexCatBtn, selectedCategory === 'SEMUA' && styles.indexCatBtnActive]}
              onPress={() => setSelectedCategory('SEMUA')}
            >
              <Text style={[styles.indexCatText, selectedCategory === 'SEMUA' && styles.indexCatTextActive]}>
                SEMUA ({items.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.indexCatBtn, selectedCategory === 'MANHWA' && styles.indexCatBtnActive]}
              onPress={() => setSelectedCategory('MANHWA')}
            >
              <Text style={[styles.indexCatText, selectedCategory === 'MANHWA' && styles.indexCatTextActive]}>
                MANHWA ({manhwaCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.indexCatBtn, selectedCategory === 'MANGA' && styles.indexCatBtnActive]}
              onPress={() => setSelectedCategory('MANGA')}
            >
              <Text style={[styles.indexCatText, selectedCategory === 'MANGA' && styles.indexCatTextActive]}>
                MANGA ({mangaCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.indexCatBtn, selectedCategory === 'ANIME' && styles.indexCatBtnActive]}
              onPress={() => setSelectedCategory('ANIME')}
            >
              <Text style={[styles.indexCatText, selectedCategory === 'ANIME' && styles.indexCatTextActive]}>
                ANIME ({animeCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.indexCatBtn, selectedCategory === 'NOVEL' && styles.indexCatBtnActive]}
              onPress={() => setSelectedCategory('NOVEL')}
            >
              <Text style={[styles.indexCatText, selectedCategory === 'NOVEL' && styles.indexCatTextActive]}>
                NOVEL ({novelCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sub Filters Row (Status Filter) */}
          <View style={styles.subFilterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterPillsGroup}>
              <TouchableOpacity
                style={[styles.subPill, selectedStatusFilter === 'SEMUA' && styles.subPillActiveYellow]}
                onPress={() => setSelectedStatusFilter('SEMUA')}
              >
                <Text style={[styles.subPillText, selectedStatusFilter === 'SEMUA' && styles.subPillTextActive]}>
                  Semua
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subPill, selectedStatusFilter === 'Aktif' && styles.subPillActiveYellow]}
                onPress={() => setSelectedStatusFilter('Aktif')}
              >
                <Text style={[styles.subPillText, selectedStatusFilter === 'Aktif' && styles.subPillTextActive]}>
                  Aktif
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subPill, selectedStatusFilter === 'Selesai' && styles.subPillActiveYellow]}
                onPress={() => setSelectedStatusFilter('Selesai')}
              >
                <Text style={[styles.subPillText, selectedStatusFilter === 'Selesai' && styles.subPillTextActive]}>
                  Selesai
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subPill, selectedStatusFilter === 'Rencana' && styles.subPillActiveYellow]}
                onPress={() => setSelectedStatusFilter('Rencana')}
              >
                <Text style={[styles.subPillText, selectedStatusFilter === 'Rencana' && styles.subPillTextActive]}>
                  Rencana
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subPill, selectedStatusFilter === 'On Hold' && styles.subPillActiveYellow]}
                onPress={() => setSelectedStatusFilter('On Hold')}
              >
                <Text style={[styles.subPillText, selectedStatusFilter === 'On Hold' && styles.subPillTextActive]}>
                  On Hold
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Scrollable Items List */}
          <ScrollView
            style={styles.masterListScroll}
            contentContainerStyle={styles.masterListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedItem.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.masterItemCard,
                    isSelected && styles.masterItemCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onSelectItem(item)}
                >
                  <View style={styles.masterItemMainRow}>
                    <Image
                      source={{ uri: item.cover }}
                      style={styles.masterItemThumbnail}
                      resizeMode="cover"
                    />

                    <View style={styles.masterItemInfo}>
                      <View style={styles.masterItemTopRow}>
                        <View style={styles.masterItemTypeBadge}>
                          <Text style={styles.masterItemTypeText}>
                            {item.tipe.toUpperCase()}
                          </Text>
                        </View>

                        {item.status === 'Aktif' ? (
                          <View style={styles.masterStatusRow}>
                            <Text style={styles.statusDotBlue}>•</Text>
                            <Text style={styles.statusTextBlue}>Aktif</Text>
                          </View>
                        ) : item.status === 'Selesai' ? (
                          <View style={styles.masterStatusRow}>
                            <Text style={styles.statusCheck}>✓</Text>
                            <Text style={styles.statusTextDone}>Selesai</Text>
                          </View>
                        ) : (
                          <View style={styles.masterStatusRow}>
                            <Text style={styles.statusCircle}>○</Text>
                            <Text style={styles.statusTextPlan}>Rencana</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.masterItemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={styles.masterItemBottomRow}>
                        <Text style={styles.masterItemChapter}>
                          {item.publisher || item.author || 'Tersinkron'}
                        </Text>
                        <Text style={styles.masterItemTime}>
                          {item.updatedAtText}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sticky Bottom Add Button */}
          <TouchableOpacity
            style={styles.addNewItemBtn}
            onPress={onAddNew || (() => Alert.alert('Tambah Judul Baru', 'Fitur tambah entri baru ke Notion'))}
            activeOpacity={0.85}
          >
            <Text style={styles.addNewItemText}>+ TAMBAH JUDUL BARU</Text>
          </TouchableOpacity>
        </View>

        {/* Right Column: Detail Inspector Pane */}
        <ScrollView
          style={styles.detailPaneScroll}
          contentContainerStyle={styles.detailPaneContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Breadcrumb & Action Icons Row */}
          <View style={styles.detailBreadcrumbRow}>
            <View style={styles.breadcrumbLeft}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>{selectedItem.id}</Text>
              </View>
              <Text style={styles.breadcrumbPath}>DATABASE / VAULT / READING</Text>
            </View>

            <View style={styles.detailActionIcons}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => Alert.alert('Share', `Bagikan entri ${selectedItem.title}`)}
              >
                <Text style={styles.actionIcon}>🔗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => Alert.alert('Sync', 'Menyinkronkan entri dengan Notion...')}
              >
                <Text style={styles.actionIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Card */}
          <View style={styles.detailHeroCard}>
            <View style={styles.heroCoverWrapper}>
              <Image
                source={{ uri: selectedItem.cover }}
                style={styles.heroCoverImage}
                resizeMode="cover"
              />
              <View style={styles.hdBadge}>
                <Text style={styles.hdBadgeText}>HD</Text>
              </View>
            </View>

            <View style={styles.heroInfoCol}>
              <View style={styles.heroBadgesRow}>
                <View style={styles.heroTypeBadge}>
                  <Text style={styles.heroTypeBadgeText}>
                    {selectedItem.tipe.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.readingWatchingBadge}>
                  <Text style={styles.readingWatchingText}>Reading/Watching</Text>
                </View>
              </View>

              <Text style={styles.heroItemTitle}>{selectedItem.title.toUpperCase()}</Text>

              <View style={styles.heroTimestampRow}>
                <Text style={styles.clockIcon}>🕒</Text>
                <Text style={styles.timestampText}>
                  Diperbarui: {selectedItem.dateAdded || '24 Okt 2024 · 14:32 WIB'}
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action Buttons Row */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.readMangagoBtn}
              onPress={() => openItemLink(selectedItem)}
              activeOpacity={0.85}
            >
              <Text style={styles.readMangagoText}>
                {getReadOnInfo(selectedItem).label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notion Properties Sheet */}
          <View style={styles.notionSheetCard}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <Text style={styles.sheetHeaderIcon}>⚙️</Text>
                <Text style={styles.sheetHeaderTitle}>NOTION PROPERTIES SHEET</Text>
              </View>
            </View>

            {/* Property Rows */}
            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>☰</Text>
                <Text style={styles.propName}>Catatan</Text>
              </View>
              <Text style={styles.propValueMuted}>Empty</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Catatan', 'Gunakan kolom Catatan Cepat di bawah')}
              >
                <Text style={styles.propActionBlue}>+ Tambah catatan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>👤</Text>
                <Text style={styles.propName}>Created by</Text>
              </View>
              <View style={styles.createdByUserRow}>
                <View style={styles.userSmallIcon}>
                  <Text style={styles.userSmallText}>🦊</Text>
                </View>
                <Text style={styles.propValueBold}>arya</Text>
              </View>
            </View>

            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>🕒</Text>
                <Text style={styles.propName}>Ditambahkan</Text>
              </View>
              <Text style={styles.propValueText}>
                {selectedItem.lastEdited || 'September 26, 2026 10:30 PM'}
              </Text>
            </View>

            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>🔄</Text>
                <Text style={styles.propName}>Status</Text>
              </View>
              <View style={styles.statusPillSheet}>
                <Text style={styles.statusPillSheetText}>Reading/Watching</Text>
              </View>
            </View>

            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>🏷️</Text>
                <Text style={styles.propName}>Tags</Text>
              </View>
              <View style={styles.tagsContainerSheet}>
                {selectedItem.tags.map((tag) => (
                  <View key={tag} style={styles.tagPillSheet}>
                    <Text style={styles.tagPillSheetText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.propertyRow}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>🔗</Text>
                <Text style={styles.propName}>Link</Text>
              </View>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => openItemLink(selectedItem)}
              >
                <Text style={styles.linkTextSheet} numberOfLines={1}>
                  {selectedItem.sourceLink}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyLinkBtn}
                onPress={() => Alert.alert('Tersalin', 'URL tersalin ke clipboard')}
              >
                <Text style={styles.copyLinkIcon}>📋</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.propertyRow, { borderBottomWidth: 0 }]}>
              <View style={styles.propLabelCol}>
                <Text style={styles.propIcon}>🌐</Text>
                <Text style={styles.propName}>Bahasa / Sumber</Text>
              </View>
              <View style={styles.langSourceRow}>
                <Text style={styles.langText}>
                  {selectedItem.language || 'Bahasa Indonesia'} •
                </Text>
                <View style={styles.officialPill}>
                  <Text style={styles.officialPillText}>
                    {selectedItem.sourceType || 'Official Webtoon'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Notes Textarea */}
          <View style={styles.quickNotesCard}>
            <View style={styles.quickNotesHeader}>
              <View style={styles.quickNotesTitleGroup}>
                <Text style={styles.notesHeaderIcon}>📝</Text>
                <Text style={styles.notesHeaderTitle}>
                  CATATAN BACAAN CEPAT
                </Text>
              </View>
              <Text style={styles.autoSaveText}>Auto-save</Text>
            </View>

            <TextInput
              style={styles.notesTextInput}
              placeholder="Tulis catatan bacaan untuk bab ini..."
              placeholderTextColor="#888888"
              multiline
              numberOfLines={4}
              value={notesText}
              onChangeText={(text) => {
                setNotesText(text);
                onUpdateNotes(selectedItem.id, text);
              }}
            />
          </View>
        </ScrollView>
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
  viewModeActive: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  viewModeActiveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#171717',
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
  // Split Container
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // Master Column
  masterColumn: {
    width: '38%',
    borderRightWidth: 1.5,
    borderRightColor: '#171717',
    backgroundColor: '#F5F2EB',
    display: 'flex',
    flexDirection: 'column',
  },
  indexHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  indexTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexYellowIconBox: {
    width: 12,
    height: 12,
    backgroundColor: '#F5BA13',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#171717',
  },
  indexTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  syncedItemsBadge: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  syncedItemsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
  },
  indexCategoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  indexCatBtn: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  indexCatBtnActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  indexCatText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
  },
  indexCatTextActive: {
    color: '#FFFFFF',
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDD2',
  },
  subFilterPillsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  subPill: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  subPillActiveYellow: {
    backgroundColor: '#F5BA13',
    borderColor: '#171717',
  },
  subPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
  },
  subPillTextActive: {
    color: '#171717',
  },
  sortSmallBtn: {
    padding: 4,
  },
  sortSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#171717',
  },
  masterListScroll: {
    flex: 1,
  },
  masterListContent: {
    padding: 12,
    gap: 8,
  },
  masterItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    overflow: 'hidden',
  },
  masterItemCardSelected: {
    borderColor: '#171717',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
  },
  masterItemMainRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 10,
  },
  masterItemThumbnail: {
    width: 44,
    height: 58,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#171717',
  },
  masterItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  masterItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  masterItemTypeBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  masterItemTypeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  masterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDotBlue: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  statusTextBlue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusCheck: {
    fontSize: 9,
    color: '#171717',
    fontWeight: 'bold',
  },
  statusTextDone: {
    fontSize: 9,
    fontWeight: '800',
    color: '#171717',
  },
  statusCircle: {
    fontSize: 9,
    color: '#DC2626',
  },
  statusTextPlan: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  masterItemTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 2,
  },
  masterItemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterItemChapter: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '700',
  },
  masterItemTime: {
    fontSize: 9,
    color: '#888888',
  },
  itemProgressTrack: {
    height: 3,
    backgroundColor: '#EAE6DC',
    width: '100%',
  },
  itemProgressFill: {
    height: '100%',
  },
  addNewItemBtn: {
    backgroundColor: '#171717',
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewItemText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  // Detail Pane (Right)
  detailPaneScroll: {
    flex: 1,
  },
  detailPaneContent: {
    padding: 20,
    gap: 16,
  },
  detailBreadcrumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breadcrumbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  idBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  breadcrumbPath: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.6,
  },
  detailActionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#EAE6DC',
    borderWidth: 1,
    borderColor: '#D8D3C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
    color: '#171717',
  },
  starActive: {
    color: '#F5BA13',
  },
  // Hero Card
  detailHeroCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  heroCoverWrapper: {
    position: 'relative',
    width: 140,
    height: 180,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#171717',
  },
  heroCoverImage: {
    width: '100%',
    height: '100%',
  },
  hdBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  hdBadgeText: {
    color: '#F5BA13',
    fontSize: 8,
    fontWeight: '900',
  },
  heroInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  heroTypeBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  heroTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  readingWatchingBadge: {
    backgroundColor: '#F8E9B9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E6C665',
  },
  readingWatchingText: {
    color: '#854D0E',
    fontSize: 9,
    fontWeight: '900',
  },
  heroItemTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 6,
  },
  heroTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  clockIcon: {
    fontSize: 12,
  },
  timestampText: {
    fontSize: 11,
    color: '#666666',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#E2DDD2',
    marginVertical: 10,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressHeaderLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  progressHeaderFraction: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#EAE6DC',
    borderWidth: 1,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#171717',
  },
  stepProgressTrack: {
    flex: 1,
    height: 32,
    backgroundColor: '#EAE6DC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#171717',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: '#F5BA13',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  stepProgressText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
  },
  // Hero Actions
  heroActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  readMangagoBtn: {
    flex: 1,
    backgroundColor: '#171717',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readMangagoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  addFavoritesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    gap: 8,
  },
  addFavoritesIcon: {
    fontSize: 13,
  },
  addFavoritesText: {
    color: '#171717',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  // Properties Sheet
  notionSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDD2',
    marginBottom: 8,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetHeaderIcon: {
    fontSize: 13,
  },
  sheetHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  addPropertyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
    gap: 12,
  },
  propLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
    gap: 8,
  },
  propIcon: {
    fontSize: 12,
    color: '#666666',
  },
  propName: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  propValueMuted: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    flex: 1,
  },
  propActionBlue: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  createdByUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  userSmallIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5BA13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSmallText: {
    fontSize: 11,
  },
  propValueBold: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
  },
  propValueText: {
    fontSize: 11,
    color: '#171717',
    fontWeight: '600',
    flex: 1,
  },
  statusPillSheet: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  statusPillSheetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  tagsContainerSheet: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tagPillSheet: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  tagPillSheetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  linkTextSheet: {
    fontSize: 11,
    color: '#2563EB',
    flex: 1,
    textDecorationLine: 'underline',
  },
  copyLinkBtn: {
    padding: 4,
  },
  copyLinkIcon: {
    fontSize: 13,
  },
  langSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  langText: {
    fontSize: 11,
    color: '#171717',
    fontWeight: '600',
  },
  officialPill: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  officialPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#171717',
  },
  // Quick Notes Card
  quickNotesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    padding: 16,
  },
  quickNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickNotesTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesHeaderIcon: {
    fontSize: 13,
  },
  notesHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  autoSaveText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#666666',
  },
  notesTextInput: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#171717',
    borderRadius: 6,
    padding: 12,
    fontSize: 12,
    color: '#171717',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
