import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../context/AuthContext';
import { previewMangaFromUrl, saveLiveItemToNotion, type MangaPreviewResult } from '../services/api';

interface ShareToNotionModalProps {
  visible: boolean;
  onClose: () => void;
  initialSharedText?: string;
  onSavedSuccess?: () => void;
}

export function ShareToNotionModal({
  visible,
  onClose,
  initialSharedText = '',
  onSavedSuccess,
}: ShareToNotionModalProps) {
  const { token } = useAuth();

  const [inputUrl, setInputUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<MangaPreviewResult | null>(null);

  // Editable fields for user adjustment before saving
  const [title, setTitle] = useState('');
  const [tipe, setTipe] = useState<'Manhwa' | 'Manga' | 'Anime' | 'Novel'>('Manhwa');
  const [status, setStatus] = useState<'Plan to Read' | 'Reading/Watching' | 'Completed'>('Reading/Watching');
  const [notes, setNotes] = useState('');

  // When opened with shared text/URL, set it and trigger preview immediately
  useEffect(() => {
    if (visible && initialSharedText) {
      const urlMatch = initialSharedText.match(/(https?:\/\/[^\s]+)/i);
      setInputUrl(urlMatch ? urlMatch[1] : initialSharedText);
      handleExtractMetadata(initialSharedText);
    } else if (visible && !initialSharedText && !previewItem) {
      setInputUrl('');
    }
  }, [visible, initialSharedText]);

  // Extract metadata via backend endpoint /api/manga/preview
  const handleExtractMetadata = async (targetText?: string) => {
    const textToQuery = (targetText || inputUrl).trim();
    if (!textToQuery) {
      Alert.alert('Perhatian', 'Masukkan atau tempel link komik/anime terlebih dahulu.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Sesi tidak ditemukan. Harap login terlebih dahulu.');
      return;
    }

    // Clean up inputUrl if targetText contained an embedded URL
    const urlMatch = textToQuery.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch && urlMatch[1]) {
      setInputUrl(urlMatch[1]);
    }

    setIsExtracting(true);
    setPreviewItem(null);

    try {
      const res = await previewMangaFromUrl(token, textToQuery);
      if (res.data && res.data.length > 0) {
        const item = res.data[0];
        setPreviewItem(item);
        setTitle(item.title || '');
        setTipe(
          (item.tipe === 'Manga' || item.tipe === 'Anime' || item.tipe === 'Novel'
            ? item.tipe
            : 'Manhwa') as any
        );
        setStatus(
          (item.status === 'Completed' || item.status === 'Plan to Read'
            ? item.status
            : 'Reading/Watching') as any
        );
        setNotes(item.description || item.notes || '');
      } else {
        Alert.alert('Gagal Ekstrak', 'Tidak dapat menemukan metadata dari link tersebut.');
      }
    } catch (err: any) {
      Alert.alert('Gagal Ekstrak', err?.message || 'Terjadi kesalahan saat mengekstrak link.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save directly to live Notion database
  const handleSaveToNotion = async () => {
    if (!token) return;
    if (!title.trim()) {
      Alert.alert('Perhatian', 'Judul komik/anime tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanTags = (previewItem?.tags || [])
        .map((t: any) => (typeof t === 'string' ? t : t?.name || ''))
        .filter((t: string) => Boolean(t) && t.trim().length > 0);

      const coverImage = previewItem?.coverUrl || (previewItem as any)?.cover || undefined;

      await saveLiveItemToNotion(token, {
        title: title.trim(),
        tipe,
        status,
        link: inputUrl.trim() || previewItem?.link || undefined,
        tags: cleanTags.length > 0 ? cleanTags : ['Tracker'],
        notes: notes.trim(),
        cover: coverImage,
        coverUrl: coverImage,
      });

      Alert.alert(
        '✓ Berhasil Disimpan',
        `"${title}" berhasil didaftarkan langsung ke database Notion Vault Anda!`,
        [
          {
            text: 'Bagus',
            onPress: () => {
              onClose();
              if (onSavedSuccess) onSavedSuccess();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err?.message || 'Gagal menyimpan entri ke database Notion.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdropPressable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>⚡</Text>
              <Text style={styles.headerTitle}>SHARE TO NOTION TRACKER</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.syncNoticeRow}>
            <View style={styles.syncTag}>
              <Text style={styles.syncTagText}>INTENT LISTENER</Text>
            </View>
            <Text style={styles.syncNoticeText}>
              Ekstraksi link otomatis dari browser ke database Notion
            </Text>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Input Section */}
            <Text style={styles.inputLabel}>LINK / URL KOMIK ATAU ANIME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="https://www.webtoons.com/... atau mangago.me..."
                placeholderTextColor="#888888"
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {inputUrl.length > 0 && (
                <TouchableOpacity onPress={() => setInputUrl('')} style={styles.clearBtn}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Ekstrak Action Button */}
            <TouchableOpacity
              style={styles.extractBtn}
              onPress={() => handleExtractMetadata()}
              disabled={isExtracting}
              activeOpacity={0.8}
            >
              {isExtracting ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#171717" />
                  <Text style={styles.extractBtnText}>MENGEKSTRAK METADATA DARI LINK...</Text>
                </View>
              ) : (
                <Text style={styles.extractBtnText}>🔍 EKSTRAK METADATA OTOMATIS</Text>
              )}
            </TouchableOpacity>

            {/* Extracted Preview Card */}
            {previewItem && (
              <View style={styles.previewCard}>
                <View style={styles.previewTopRow}>
                  <Image
                    source={{
                      uri:
                        previewItem.coverUrl ||
                        'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx105398-b673Vt5ZSuz3.jpg',
                    }}
                    style={styles.previewCover}
                    contentFit="cover"
                  />
                  <View style={styles.previewInfoCol}>
                    <Text style={styles.previewBadge}>TEREKSTRAKSI</Text>
                    <TextInput
                      style={styles.titleInput}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Judul Komik / Anime"
                      placeholderTextColor="#888888"
                    />
                    <Text style={styles.previewSourceText} numberOfLines={1}>
                      🌐 {previewItem.source || 'Webtoon / Comic Source'}
                    </Text>
                  </View>
                </View>

                {/* Tags / Genres */}
                {previewItem.tags && previewItem.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {previewItem.tags.slice(0, 6).map((t, idx) => {
                      const tagLabel = typeof t === 'string' ? t : (t as any)?.name || '';
                      if (!tagLabel) return null;
                      return (
                        <View key={idx} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tagLabel}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Type Selector (Tipe) */}
                <Text style={styles.sectionLabel}>TIPE FORMAT</Text>
                <View style={styles.typeSelectorRow}>
                  {(['Manhwa', 'Manga', 'Anime', 'Novel'] as const).map((tVal) => (
                    <TouchableOpacity
                      key={tVal}
                      style={[styles.typeBtn, tipe === tVal && styles.typeBtnActive]}
                      onPress={() => setTipe(tVal)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          tipe === tVal && styles.typeBtnTextActive,
                        ]}
                      >
                        {tVal.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Status Selector */}
                <Text style={styles.sectionLabel}>STATUS BACAAN</Text>
                <View style={styles.statusSelectorRow}>
                  {[
                    { label: 'RENCANA', value: 'Plan to Read' },
                    { label: 'AKTIF BACA', value: 'Reading/Watching' },
                    { label: 'SELESAI', value: 'Completed' },
                  ].map((sVal) => (
                    <TouchableOpacity
                      key={sVal.value}
                      style={[
                        styles.statusBtn,
                        status === sVal.value && styles.statusBtnActive,
                      ]}
                      onPress={() => setStatus(sVal.value as any)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === sVal.value && styles.statusBtnTextActive,
                        ]}
                      >
                        {sVal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes Input */}
                <Text style={styles.sectionLabel}>CATATAN SINGKAT</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Catatan bacaan cepat (opsional)..."
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={2}
                />

                {/* Save to Notion Action */}
                <TouchableOpacity
                  style={styles.saveToNotionBtn}
                  onPress={handleSaveToNotion}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <View style={styles.btnLoadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.saveBtnLoadingText}>MENYIMPAN KE NOTION...</Text>
                    </View>
                  ) : (
                    <Text style={styles.saveBtnText}>⚡ SIMPAN LANGSUNG KE NOTION</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#F5F2EB',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 2,
    borderTopColor: '#171717',
    maxHeight: '85%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D3C5',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  syncNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  syncTag: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  syncTagText: {
    color: '#F5BA13',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  syncNoticeText: {
    fontSize: 10,
    color: '#555555',
    fontWeight: '600',
    flex: 1,
  },
  scrollBody: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 12,
    color: '#171717',
    fontWeight: '600',
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: 'bold',
  },
  extractBtn: {
    backgroundColor: '#F5BA13',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#171717',
    marginBottom: 14,
  },
  extractBtnText: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    marginBottom: 16,
  },
  previewTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  previewCover: {
    width: 72,
    height: 100,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#171717',
  },
  previewInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#171717',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  titleInput: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#B8B3A8',
    paddingVertical: 2,
    marginBottom: 4,
  },
  previewSourceText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  tagChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#333333',
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D3C5',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  typeBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  statusSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D3C5',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#F5BA13',
    borderColor: '#171717',
  },
  statusBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
  },
  statusBtnTextActive: {
    color: '#171717',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: '#171717',
    marginBottom: 14,
  },
  saveToNotionBtn: {
    backgroundColor: '#171717',
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  saveBtnLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
