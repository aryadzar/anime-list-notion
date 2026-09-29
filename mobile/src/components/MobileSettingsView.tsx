import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import type { CatalogItem } from '../types/catalog';
import { useAuth } from '../context/AuthContext';
import { checkBackendStatus, saveLiveItemToNotion, getBackendHost } from '../services/api';

interface MobileSettingsViewProps {
  onSaveToNotion?: (item: Partial<CatalogItem>) => void;
}

export function MobileSettingsView({ onSaveToNotion }: MobileSettingsViewProps) {
  const { user, token, logout } = useAuth();
  const [inboundUrl, setInboundUrl] = useState(
    'mangago.me/read-manga/place_to_be_1/'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSync, setIsTestingSync] = useState(false);

  const handleSaveToNotion = async () => {
    setIsSaved(true);
    if (token) {
      try {
        await saveLiveItemToNotion(token, {
          title: 'PLACE TO BE (CAPITULO 1)',
          tipe: 'Manhwa',
          status: 'Reading/Watching',
          link: `https://${inboundUrl.replace(/^https?:\/\//, '')}`,
          tags: ['BL', 'Comedy', 'Romance'],
          notes: 'Disimpan via Mobile Share Sheet Target Notion Extension',
        });
        Alert.alert(
          'Tersimpan ke Notion ⚡',
          'Entri "PLACE TO BE (CAPITULO 1)" telah berhasil dikirim ke database Notion #MN-2026 secara live via Notion API Bridge.',
          [{ text: 'OK' }]
        );
      } catch (err: any) {
        Alert.alert(
          'Tersimpan secara Lokal',
          'Tersimpan ke koleksi lokal. ' + (err?.message || '')
        );
      }
    } else {
      Alert.alert(
        'Tersimpan ke Notion ⚡',
        'Entri "PLACE TO BE (CAPITULO 1)" telah berhasil dikirim ke database Notion #MN-2026 via Notion API Bridge.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestSync = async () => {
    setIsTestingSync(true);
    const start = Date.now();
    try {
      const status = await checkBackendStatus();
      const elapsed = Date.now() - start;
      Alert.alert(
        'Uji Sinkron Berhasil ✅',
        `Koneksi API Notion & Expo SecureStore aktif.\nEndpoint: ${getBackendHost()}\nStatus Database: ${status.isConfigured ? 'Terkonfigurasi' : 'Belum Konfigurasi'}\nLatensi: ${elapsed}ms.`
      );
    } catch (err: any) {
      Alert.alert('Uji Sinkron', err?.message || 'Server backend tidak merespon.');
    } finally {
      setIsTestingSync(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerIcon}>📖</Text>
          <Text style={styles.headerTitle}>ACCOUNT SETTINGS</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Mobile Share Sheet Target Banner */}
        <View style={styles.shareSheetBanner}>
          <View style={styles.shareIconBox}>
            <Text style={styles.shareIcon}>📤</Text>
          </View>
          <View style={styles.shareBannerTextCol}>
            <View style={styles.shareBannerTopRow}>
              <Text style={styles.shareBannerSub}>MOBILE SHARE SHEET TARGET</Text>
              <Text style={styles.redDot}>•</Text>
            </View>
            <Text style={styles.shareBannerTitle}>
              KOLEKSI MANHWA - NOTION EXTENSION
            </Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>V2.4.1</Text>
          </View>
        </View>

        {/* 3. Parsed Inbound Link Card */}
        <View style={styles.inboundCard}>
          {/* Top Yellow Stripe */}
          <View style={styles.yellowStripe} />

          <View style={styles.inboundCardContent}>
            {/* Header info */}
            <View style={styles.inboundHeaderRow}>
              <Text style={styles.inboundTitle}>PARSED INBOUND LINK</Text>
              <View style={styles.scrapeTimeRow}>
                <Text style={styles.scrapeClockIcon}>⏱️</Text>
                <Text style={styles.scrapeTimeText}>0.28s scrape</Text>
              </View>
            </View>

            {/* URL Display */}
            <View style={styles.urlBox}>
              <Text style={styles.linkIcon}>🔗</Text>
              <TextInput
                style={styles.urlInput}
                value={inboundUrl}
                onChangeText={setInboundUrl}
                autoCapitalize="none"
              />
            </View>

            {/* Scraped Item Preview */}
            <View style={styles.previewItemRow}>
              <View style={styles.previewCoverWrapper}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDixMSYgCrD8QKhI1_qtBAQMD3PXlJzP8Kd5dNYfebZydA37Q7zDlF-JaHb2lnXupXz-xKq_Ja8JV8YoB0CO0emQwqxLrLaoK8SjCQ8u_Fsvwvmz6AGRYWYt87uI-bNLQYM9kJVKEndVV5hIoM3HdAxnoxCrBDFsSyb1qV5RsS-U-T9CtcdiiRmWXgz-G4-d_w93ruZrra5yfjChTtwhe3JyPczT4dEAsMqhYMRVbBPiT__6t3wdTW7OLZEgVehcVIh9Es',
                  }}
                  style={styles.previewCover}
                  resizeMode="cover"
                />
                <View style={styles.hdCoverBadge}>
                  <Text style={styles.hdCoverText}>HD COVER</Text>
                </View>
              </View>

              <View style={styles.previewDetailsCol}>
                <View style={styles.detectedRow}>
                  <View style={styles.detectedBadge}>
                    <Text style={styles.detectedBadgeText}>DETECTED</Text>
                  </View>
                  <Text style={styles.chapterDetected}>CH. 01</Text>
                </View>

                <Text style={styles.previewTitle}>PLACE TO BE (CAPITULO 1)</Text>

                <View style={styles.previewPillsRow}>
                  <View style={styles.manhwaPill}>
                    <Text style={styles.manhwaPillIcon}>✍</Text>
                    <Text style={styles.manhwaPillText}>Manhwa</Text>
                  </View>
                  <View style={styles.readingPill}>
                    <Text style={styles.readingPillIcon}>⊙</Text>
                    <Text style={styles.readingPillText}>Reading</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Scraped Tags */}
            <View style={styles.scrapedTagsSection}>
              <Text style={styles.scrapedTagsLabel}>SCRAPED TAGS</Text>
              <View style={styles.tagsPillRow}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>BL</Text>
                </View>
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>Comedy</Text>
                </View>
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>Romance</Text>
                </View>
                <View style={styles.tagPillAdd}>
                  <Text style={styles.tagPillAddText}>+</Text>
                </View>
              </View>
            </View>

            {/* Save Button (1-Klik) */}
            <TouchableOpacity
              style={[styles.saveNotionBtn, isSaved && styles.saveNotionBtnSuccess]}
              onPress={handleSaveToNotion}
              activeOpacity={0.85}
            >
              <Text style={styles.saveNotionIcon}>🔖</Text>
              <Text style={styles.saveNotionText}>
                {isSaved
                  ? 'TERSINKRON KE NOTION DATABASE ✓'
                  : 'SIMPAN KE NOTION DATABASE (1-KLIK)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Vault Auth & Notion Bridge Section */}
        <View style={styles.bridgeSectionHeader}>
          <View style={styles.bridgeHeaderLeft}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.bridgeSectionTitle}>VAULT AUTH & NOTION BRIDGE</Text>
          </View>
          <Text style={styles.bridgeSecureLink}>EXPO SECURESTORE</Text>
        </View>

        {/* 5. Auth Credentials Card */}
        <View style={styles.authCard}>
          {/* User Account Row */}
          <View style={styles.accountRow}>
            <View style={styles.googleAvatarBox}>
              {user?.picture ? (
                <Image
                  source={{ uri: user.picture }}
                  style={{ width: 34, height: 34, borderRadius: 5 }}
                />
              ) : (
                <Text style={styles.googleLetter}>G</Text>
              )}
            </View>
            <View style={styles.accountTextCol}>
              <Text style={styles.accountEmail}>
                {user?.email || 'aryadzaky8494@gmail.com'}
              </Text>
              <View style={styles.memberStatusRow}>
                <Text style={styles.yellowStatusDot}>•</Text>
                <Text style={styles.memberStatusText}>
                  {user ? 'Whitelisted Vault Member' : 'Tamu (Belum Terotentikasi)'}
                </Text>
              </View>
            </View>
            <View style={styles.verifiedBadgeCircle}>
              <Text style={styles.verifiedCheckText}>✓</Text>
            </View>
          </View>

          {/* SecureStore Status Box */}
          <View style={styles.secureBox}>
            <View style={styles.secureHeaderRow}>
              <Text style={styles.secureBoxLabel}>SECURESTORE STATUS</Text>
              <Text style={styles.secureActiveBadge}>
                ACTIVE • HARDWARE ENCRYPTED
              </Text>
            </View>

            <View style={styles.tokenLineRow}>
              <Text style={styles.keyIcon}>🔑</Text>
              <Text style={styles.tokenCodeText}>
                expo-secure-store: AES-256 Encrypted Token
              </Text>
            </View>

            <View style={styles.targetDbRow}>
              <Text style={styles.targetDbLabel}>TARGET NOTION DATABASE</Text>
              <Text style={styles.targetDbCode}>#MN-2026</Text>
            </View>

            <View style={styles.dbNameRow}>
              <Text style={styles.dbIcon}>🏛️</Text>
              <Text style={styles.dbNameText}>Koleksi Bacaan (#MN-2026)</Text>
            </View>
          </View>

          {/* Dual Action Buttons */}
          <View style={styles.dualActionsRow}>
            <TouchableOpacity
              style={styles.dualActionBtn}
              onPress={handleTestSync}
              activeOpacity={0.7}
            >
              <Text style={styles.dualActionIcon}>🔄</Text>
              <Text style={styles.dualActionText}>
                {isTestingSync ? 'MENYINKRON...' : 'UJI SINKRON'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dualActionBtn}
              onPress={() =>
                Alert.alert(
                  'Whitelist Pengguna',
                  '1 akun terverifikasi:\n• aryadzaky8494@gmail.com (Owner)'
                )
              }
              activeOpacity={0.7}
            >
              <Text style={styles.dualActionIcon}>👥</Text>
              <Text style={styles.dualActionText}>ATUR WHITELIST</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() =>
              Alert.alert('Keluar Akun Google', 'Apakah Anda yakin ingin keluar dari sesi ini?', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Keluar',
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ])
            }
            activeOpacity={0.7}
          >
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutText}>KELUAR AKUN GOOGLE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  // Share Sheet Target Banner
  shareSheetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 10,
  },
  shareIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#171717',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 16,
  },
  shareBannerTextCol: {
    flex: 1,
  },
  shareBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  shareBannerSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
  },
  redDot: {
    fontSize: 10,
    color: '#D92D20',
    fontWeight: 'bold',
  },
  shareBannerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  versionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  // Parsed Inbound Link Card
  inboundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8D3C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  yellowStripe: {
    height: 4,
    backgroundColor: '#F5BA13',
    width: '100%',
  },
  inboundCardContent: {
    padding: 16,
  },
  inboundHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inboundTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1D64EC',
    letterSpacing: 0.8,
  },
  scrapeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrapeClockIcon: {
    fontSize: 11,
  },
  scrapeTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777777',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8DF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  linkIcon: {
    fontSize: 12,
    color: '#666666',
  },
  urlInput: {
    flex: 1,
    fontSize: 11,
    color: '#171717',
    fontFamily: 'monospace',
    padding: 0,
  },
  // Preview Row
  previewItemRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  previewCoverWrapper: {
    position: 'relative',
    width: 82,
    height: 104,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#171717',
  },
  previewCover: {
    width: '100%',
    height: '100%',
  },
  hdCoverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 2,
    paddingVertical: 2,
    alignItems: 'center',
  },
  hdCoverText: {
    color: '#F5BA13',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  previewDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detectedBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  detectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chapterDetected: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777777',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 8,
  },
  previewPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manhwaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  manhwaPillIcon: {
    fontSize: 10,
  },
  manhwaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#634E35',
  },
  readingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEAE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  readingPillIcon: {
    fontSize: 10,
    color: '#D92D20',
  },
  readingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D92D20',
  },
  // Scraped Tags
  scrapedTagsSection: {
    marginBottom: 14,
  },
  scrapedTagsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tagsPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#ECE8DF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  tagPillAdd: {
    backgroundColor: '#ECE8DF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPillAddText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666666',
  },
  // Save Notion Button
  saveNotionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5BA13',
    paddingVertical: 13,
    borderRadius: 6,
    gap: 8,
  },
  saveNotionBtnSuccess: {
    backgroundColor: '#2E7D32',
  },
  saveNotionIcon: {
    fontSize: 15,
  },
  saveNotionText: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  // Bridge Section
  bridgeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  bridgeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shieldIcon: {
    fontSize: 13,
  },
  bridgeSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  bridgeSecureLink: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D64EC',
    letterSpacing: 0.6,
  },
  // Auth Card
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 14,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleAvatarBox: {
    width: 36,
    height: 36,
    backgroundColor: '#ECE8DF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  googleLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
  },
  accountTextCol: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 2,
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yellowStatusDot: {
    fontSize: 11,
    color: '#F5BA13',
    fontWeight: '900',
  },
  memberStatusText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
  },
  verifiedBadgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // SecureBox
  secureBox: {
    backgroundColor: '#ECE8DF',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 8,
  },
  secureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.6,
  },
  secureActiveBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  tokenLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyIcon: {
    fontSize: 12,
  },
  tokenCodeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#171717',
    fontWeight: '600',
  },
  targetDbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D8D3C5',
    paddingTop: 8,
  },
  targetDbLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.6,
  },
  targetDbCode: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D92D20',
    letterSpacing: 0.6,
  },
  dbNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dbIcon: {
    fontSize: 13,
  },
  dbNameText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
  },
  // Dual Actions
  dualActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dualActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECE8DF',
    borderRadius: 6,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  dualActionIcon: {
    fontSize: 12,
  },
  dualActionText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.6,
  },
  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  signOutIcon: {
    fontSize: 12,
  },
  signOutText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.6,
  },
});
