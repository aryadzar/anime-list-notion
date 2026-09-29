import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  SortOption,
  SORT_LABELS,
  TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../utils/filterSort';

interface SearchFilterSortBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalFilteredCount: number;
  totalAllCount: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  typeCounts?: Record<string, number>;
}

export function SearchFilterSortBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  totalFilteredCount,
  totalAllCount,
  isRefreshing = false,
  onRefresh,
  typeCounts = {},
}: SearchFilterSortBarProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const isFilterActive =
    (selectedType !== 'all' && selectedType !== 'SEMUA') ||
    (selectedStatus !== 'all' && selectedStatus !== 'SEMUA') ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onStatusChange('all');
    onSortChange('default');
    setShowFilterModal(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Search Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari koleksi, tag, catatan..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sync / Refresh Button */}
        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#171717" />
            ) : (
              <Text style={styles.refreshIcon}>🔄</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Sub-Toolbar: Controls & Quick Type Pills */}
      <View style={styles.toolbarRow}>
        {/* Filter Modal Trigger */}
        <TouchableOpacity
          style={[styles.toolBtn, isFilterActive && styles.toolBtnActive]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.toolIcon}>☰</Text>
          <Text style={[styles.toolText, isFilterActive && styles.toolTextActive]}>
            Filter
          </Text>
          {isFilterActive && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Sort Modal Trigger */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.toolIcon}>⇅</Text>
          <Text style={styles.toolText} numberOfLines={1}>
            {sortBy === 'default' ? 'Urutkan' : SORT_LABELS[sortBy]}
          </Text>
          <Text style={styles.arrowDown}>⌄</Text>
        </TouchableOpacity>

        {/* Total Count Badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {totalFilteredCount} / {totalAllCount}
          </Text>
        </View>
      </View>

      {/* 3. Horizontal Type Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScrollContent}
      >
        {TYPE_OPTIONS.map((opt) => {
          const isSelected =
            selectedType.toLowerCase() === opt.id.toLowerCase() ||
            (opt.id === 'all' && (selectedType === 'all' || selectedType === 'SEMUA'));
          const count =
            opt.id === 'all'
              ? totalAllCount
              : typeCounts[opt.id] ?? 0;

          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.typePill, isSelected && styles.typePillSelected]}
              onPress={() => onTypeChange(opt.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.typePillText, isSelected && styles.typePillTextSelected]}
              >
                {opt.label.toUpperCase()}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.typeCountCircle,
                    isSelected && styles.typeCountCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeCountText,
                      isSelected && styles.typeCountTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalHeaderIcon}>☰</Text>
                <Text style={styles.modalTitle}>FILTER KOLEKSI</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Section: Tipe */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>TIPE FORMAT</Text>
              <View style={styles.chipGrid}>
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected =
                    selectedType.toLowerCase() === opt.id.toLowerCase() ||
                    (opt.id === 'all' && (selectedType === 'all' || selectedType === 'SEMUA'));
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => onTypeChange(opt.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Filter Section: Status */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>STATUS BACA</Text>
              <View style={styles.chipGrid}>
                {STATUS_OPTIONS.map((s) => {
                  const isSelected =
                    selectedStatus.toLowerCase() === s.id.toLowerCase() ||
                    (s.id === 'all' && (selectedStatus === 'all' || selectedStatus === 'SEMUA'));
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => onStatusChange(s.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              {isFilterActive && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleResetFilters}
                >
                  <Text style={styles.resetBtnText}>Reset Filter</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyBtnText}>
                  Terapkan ({totalFilteredCount} item)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 5. Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalHeaderIcon}>⇅</Text>
                <Text style={styles.modalTitle}>URUTKAN BERDASARKAN</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Sort Options List */}
            <View style={styles.sortListContainer}>
              {(
                [
                  'default',
                  'title-asc',
                  'title-desc',
                  'date-newest',
                  'date-edited',
                ] as SortOption[]
              ).map((optKey) => {
                const isSelected = sortBy === optKey;
                return (
                  <TouchableOpacity
                    key={optKey}
                    style={[
                      styles.sortOptionRow,
                      isSelected && styles.sortOptionRowSelected,
                    ]}
                    onPress={() => {
                      onSortChange(optKey);
                      setShowSortModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        isSelected && styles.sortOptionTextSelected,
                      ]}
                    >
                      {SORT_LABELS[optKey]}
                    </Text>
                    {isSelected && (
                      <View style={styles.sortCheckBadge}>
                        <Text style={styles.sortCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F2EB',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DDCF',
  },
  // Search Bar
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#666666',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#171717',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: 'bold',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 16,
  },
  // Toolbar
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  toolBtnActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  toolIcon: {
    fontSize: 12,
    color: '#171717',
  },
  toolText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
  },
  toolTextActive: {
    color: '#F5BA13',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5BA13',
    marginLeft: 2,
  },
  arrowDown: {
    fontSize: 11,
    fontWeight: '900',
    color: '#555555',
  },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: '#E2DDCF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
  },
  // Type Pills
  typeScrollContent: {
    gap: 6,
    paddingBottom: 6,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  typePillSelected: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
  },
  typePillTextSelected: {
    color: '#F5BA13',
  },
  typeCountCircle: {
    backgroundColor: '#EAE6DC',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeCountCircleSelected: {
    backgroundColor: '#333333',
  },
  typeCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  typeCountTextSelected: {
    color: '#F5BA13',
  },
  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 2,
    borderColor: '#171717',
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE6DC',
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderIcon: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F2EB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555555',
  },
  chipTextActive: {
    color: '#F5BA13',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#171717',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F5BA13',
    letterSpacing: 0.5,
  },
  // Sort List
  sortListContainer: {
    gap: 6,
    marginBottom: 10,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2DDCF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortOptionRowSelected: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#333333',
  },
  sortOptionTextSelected: {
    color: '#F5BA13',
  },
  sortCheckBadge: {
    backgroundColor: '#F5BA13',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortCheckText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
  },
});
