import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { MOCK_USER_STATS } from '../data/mockCatalog';
import type { UserStats } from '../types/catalog';

interface MobileStatsViewProps {
  stats?: UserStats;
  onOpenSettings?: () => void;
}

export function MobileStatsView({
  stats = MOCK_USER_STATS,
  onOpenSettings,
}: MobileStatsViewProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `📊 My Anime & Manhwa Vault Wrapped 2026\n` +
          `🏆 Persona: ${stats.personaTitle} (${stats.level})\n` +
          `⏱️ ${stats.totalReadingHours} Jam Baca (${stats.chaptersCompleted} Bab Selesai)\n` +
          `⚡ Kecepatan: ${stats.averageSpeed} Bab / 24 Jam\n` +
          `📚 Distribusi: Manhwa ${stats.formatBreakdown.manhwa}% | Manga ${stats.formatBreakdown.manga}% | Anime ${stats.formatBreakdown.anime}%\n` +
          `Tersinkronisasi otomatis dengan Notion Vault Database.`,
      });
    } catch {
      Alert.alert('Berbagi Statistik', 'Statistik siap dibagikan ke media sosial!');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerIcon}>📖</Text>
          <Text style={styles.headerTitle}>STATS WRAPPED</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton} onPress={onOpenSettings}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Dark Hero Card: ANALYTICS WRAPPED */}
        <View style={styles.heroDarkCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTagline}>VAULT ARCHIVE // 2026</Text>
            <View style={styles.editionBadge}>
              <Text style={styles.editionBadgeText}>{stats.edition}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>ANALYTICS</Text>
          <Text style={styles.heroTitle}>WRAPPED</Text>

          <Text style={styles.heroDescription}>
            Kalkulasi telemetri konsumsi panel visual, ritme pembacaan mingguan, dan
            kurasi multi-format sepanjang siklus tahunan.
          </Text>

          <View style={styles.heroPillsContainer}>
            <View style={styles.heroYellowPill}>
              <Text style={styles.heroPillIcon}>🏆</Text>
              <Text style={styles.heroYellowPillText}>{stats.personaTitle}</Text>
            </View>
            <View style={styles.heroGreyPill}>
              <Text style={styles.heroPillIcon}>📺</Text>
              <Text style={styles.heroGreyPillText}>OTAKU CINEMA CONNOISSEUR</Text>
            </View>
          </View>
        </View>

        {/* 3. Persona Card (Light card) */}
        <View style={styles.personaCard}>
          <View style={styles.personaHeaderRow}>
            <View style={styles.personaIconBox}>
              <Text style={styles.personaIcon}>{stats.personaIcon}</Text>
            </View>
            <View style={styles.personaBadgeGroup}>
              <View style={styles.topReaderBadge}>
                <Text style={styles.topReaderBadgeText}>TOP 1% READER</Text>
              </View>
              <Text style={styles.mythicText}>TINGKAT MYTHIC</Text>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
          </View>

          <Text style={styles.personaTitleText}>{stats.personaTitle}</Text>
          <Text style={styles.personaSubtitleText}>{stats.personaSubtitle}</Text>

          <View style={styles.personaMetricsRow}>
            <View style={styles.personaMetricBox}>
              <Text style={styles.personaMetricLabel}>LEVEL</Text>
              <Text style={styles.personaMetricValue}>{stats.level}</Text>
            </View>
            <View style={styles.personaMetricBox}>
              <Text style={styles.personaMetricLabel}>PANEL/HARI</Text>
              <Text style={styles.personaMetricValue}>{stats.panelsPerDay}</Text>
            </View>
            <View style={styles.personaMetricBox}>
              <Text style={styles.personaMetricLabel}>PRESISI</Text>
              <Text style={styles.personaMetricValue}>{stats.precision}</Text>
            </View>
          </View>
        </View>

        {/* 4. Temporal Metrics Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>METRIK AKTIVITAS TEMPORAL</Text>
          <Text style={styles.sectionSubtle}>SINKRONISASI OTOMATIS</Text>
        </View>

        {/* Big Total Reading Hours Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <Text style={styles.metricCardLabel}>TOTAL WAKTU BACA</Text>
            <Text style={styles.metricCardIcon}>⏱️</Text>
          </View>

          <View style={styles.hoursRow}>
            <Text style={styles.hugeNumber}>{stats.totalReadingHours}</Text>
            <Text style={styles.hugeUnit}>JAM TERVERIFIKASI</Text>
          </View>

          <View style={styles.metricCardFooter}>
            <View style={styles.redDotRow}>
              <View style={styles.redDot} />
              <Text style={styles.footerNoteText}>
                Setara dengan pembacaan tanpa henti selama
              </Text>
            </View>
            <Text style={styles.footerHighlightValue}>{stats.totalReadingDays} Hari</Text>
          </View>
        </View>

        {/* 2-Column Temporal Cards */}
        <View style={styles.dualCardsRow}>
          <View style={styles.dualCard}>
            <View style={styles.dualCardHeader}>
              <Text style={styles.dualCardLabel}>CHAPTER SELESAI</Text>
              <Text style={styles.dualCardIcon}>📖</Text>
            </View>
            <Text style={styles.dualCardNumber}>
              {stats.chaptersCompleted.toLocaleString()}
            </Text>
            <Text style={styles.dualCardSub}>EPISOD & ARC DITUTUP</Text>
          </View>

          <View style={styles.dualCard}>
            <View style={styles.dualCardHeader}>
              <Text style={styles.dualCardLabel}>KECEPATAN RERATA</Text>
              <Text style={styles.dualCardIcon}>⚡</Text>
            </View>
            <Text style={styles.dualCardNumber}>{stats.averageSpeed}</Text>
            <Text style={styles.dualCardSub}>CHAPTER / 24 JAM</Text>
          </View>
        </View>

        {/* 5. Format Consumption (Donut Chart Visual) */}
        <View style={styles.formatCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSuperTitle}>DISTRIBUSI MEDIA</Text>
              <Text style={styles.cardMainTitle}>FORMAT CONSUMPTION</Text>
            </View>
            <Text style={styles.chartHeaderIcon}>◵</Text>
          </View>

          <View style={styles.donutSectionRow}>
            {/* Native Donut Chart Representation */}
            <View style={styles.donutOuterRing}>
              <View style={styles.donutSegmentTopRight} />
              <View style={styles.donutCenterCutout}>
                <Text style={styles.donutCenterNumber}>
                  {stats.formatBreakdown.totalTitles}
                </Text>
                <Text style={styles.donutCenterLabel}>TOTAL JUDUL</Text>
              </View>
            </View>

            {/* Legend Column */}
            <View style={styles.donutLegendCol}>
              <View style={styles.legendRow}>
                <View style={[styles.legendBox, { backgroundColor: '#171717' }]} />
                <Text style={styles.legendName}>MANHWA</Text>
                <Text style={styles.legendPercent}>
                  {stats.formatBreakdown.manhwa}%
                </Text>
              </View>

              <View style={styles.legendRow}>
                <View style={[styles.legendBox, { backgroundColor: '#B8B3A8' }]} />
                <Text style={styles.legendName}>MANGA</Text>
                <Text style={styles.legendPercent}>
                  {stats.formatBreakdown.manga}%
                </Text>
              </View>

              <View style={styles.legendRow}>
                <View style={[styles.legendBox, { backgroundColor: '#57544E' }]} />
                <Text style={styles.legendName}>ANIME</Text>
                <Text style={styles.legendPercent}>
                  {stats.formatBreakdown.anime}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. Top 5 Genre Performance */}
        <View style={styles.genreCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSuperTitle}>MATRIKS AFINITAS</Text>
              <Text style={styles.cardMainTitle}>TOP 5 GENRE PERFORMANCE</Text>
            </View>
            <View style={styles.dataBadge}>
              <Text style={styles.dataBadgeText}>2026 DATA</Text>
            </View>
          </View>

          <View style={styles.genreBarsContainer}>
            {stats.topGenres.map((genre) => (
              <View key={genre.rank} style={styles.genreRow}>
                <View style={styles.genreTextRow}>
                  <Text style={styles.genreRank}>{genre.rank}</Text>
                  <Text style={styles.genreName}>{genre.name}</Text>
                  <Text style={styles.genrePercent}>{genre.percentage}%</Text>
                </View>
                <View style={styles.genreBarTrack}>
                  <View
                    style={[
                      styles.genreBarFill,
                      { width: `${genre.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 7. MVP Highlight Card: Torehan Terpanjang */}
        <View style={styles.streakCard}>
          <View style={styles.streakCoverWrapper}>
            <Image
              source={{ uri: stats.longestStreak.cover }}
              style={styles.streakCover}
              resizeMode="cover"
            />
            <View style={styles.mvpBadge}>
              <Text style={styles.mvpBadgeText}>MVP</Text>
            </View>
          </View>

          <View style={styles.streakInfo}>
            <Text style={styles.streakSuperTitle}>TOREHAN TERPANJANG</Text>
            <Text style={styles.streakTitle}>{stats.longestStreak.title}</Text>
            <Text style={styles.streakDesc} numberOfLines={2}>
              Menghabiskan {stats.longestStreak.hours} jam nonstop membaca ulang
              seluruh babak...
            </Text>
            <View style={styles.streakRecordRow}>
              <Text style={styles.streakRecordIcon}>⏱️</Text>
              <Text style={styles.streakRecordText}>
                REKOR {stats.longestStreak.chaptersPerDay} CHAPTER / HARI
              </Text>
            </View>
          </View>
        </View>

        {/* 8. Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.shareButtonText}>BAGIKAN REKAP STATISTIK ↗</Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  // Dark Hero Card
  heroDarkCard: {
    backgroundColor: '#1C1B1F',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2D2C30',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F5BA13',
    letterSpacing: 0.8,
  },
  editionBadge: {
    backgroundColor: '#F5BA13',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  editionBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 12,
    color: '#A09D95',
    lineHeight: 18,
    marginVertical: 12,
  },
  heroPillsContainer: {
    gap: 8,
  },
  heroYellowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5BA13',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
  },
  heroPillIcon: {
    fontSize: 14,
  },
  heroYellowPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  heroGreyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
  },
  heroGreyPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  // Persona Card
  personaCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  personaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  personaIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#171717',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaIcon: {
    fontSize: 18,
  },
  personaBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  topReaderBadge: {
    backgroundColor: '#D92D20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  topReaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mythicText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
  },
  verifiedCheck: {
    fontSize: 12,
    color: '#171717',
    fontWeight: '900',
  },
  personaTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 6,
  },
  personaSubtitleText: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
    marginBottom: 14,
  },
  personaMetricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  personaMetricBox: {
    flex: 1,
    backgroundColor: '#F5F2EB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  personaMetricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  personaMetricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171717',
  },
  // Temporal Section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.8,
  },
  sectionSubtle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.5,
  },
  // Big Metric Card
  metricCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.8,
  },
  metricCardIcon: {
    fontSize: 14,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 12,
  },
  hugeNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#171717',
    lineHeight: 48,
  },
  hugeUnit: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  metricCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D8D3C5',
    paddingTop: 10,
  },
  redDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D92D20',
  },
  footerNoteText: {
    fontSize: 10,
    color: '#666666',
  },
  footerHighlightValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
  },
  // Dual Cards Row
  dualCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dualCard: {
    flex: 1,
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  dualCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dualCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.6,
  },
  dualCardIcon: {
    fontSize: 12,
  },
  dualCardNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 2,
  },
  dualCardSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.6,
  },
  // Format Consumption (Donut)
  formatCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardSuperTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardMainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
  },
  chartHeaderIcon: {
    fontSize: 16,
    color: '#555555',
  },
  donutSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  donutOuterRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#B8B3A8',
    position: 'relative',
  },
  donutSegmentTopRight: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 64,
    height: 64,
    borderTopRightRadius: 64,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: '#57544E',
  },
  donutCenterCutout: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EAE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#171717',
  },
  donutCenterLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
  },
  donutLegendCol: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.6,
    width: 68,
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
  },
  // Top 5 Genre Card
  genreCard: {
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  dataBadge: {
    backgroundColor: '#D8D3C5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  dataBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: 0.5,
  },
  genreBarsContainer: {
    gap: 12,
  },
  genreRow: {
    gap: 4,
  },
  genreTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genreRank: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D92D20',
    width: 22,
  },
  genreName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  genrePercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
  },
  genreBarTrack: {
    height: 8,
    backgroundColor: '#D8D3C5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: '#171717',
    borderRadius: 2,
  },
  // Streak MVP Card
  streakCard: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    gap: 12,
  },
  streakCoverWrapper: {
    position: 'relative',
    width: 68,
    height: 94,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#171717',
  },
  streakCover: {
    width: '100%',
    height: '100%',
  },
  mvpBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#171717',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  mvpBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  streakInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  streakSuperTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D92D20',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  streakTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 4,
  },
  streakDesc: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 14,
    marginBottom: 6,
  },
  streakRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakRecordIcon: {
    fontSize: 11,
  },
  streakRecordText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  // Share Button
  shareButton: {
    backgroundColor: '#171717',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
