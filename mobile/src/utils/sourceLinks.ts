import { Linking, Alert } from 'react-native';
import type { CatalogItem } from '../types/catalog';

export interface ReadOnInfo {
  label: string;
  platform: string;
  url: string;
}

/**
 * Returns dynamic platform name, label, and link for reading/watching a catalog item
 */
export function getReadOnInfo(item: CatalogItem): ReadOnInfo {
  const url = item.sourceLink || '';
  const lowerUrl = url.toLowerCase();
  const lowerSource = (item.sourceName || '').toLowerCase();
  const lowerType = (item.tipe || '').toLowerCase();

  let platform = 'MANGAGO';

  if (lowerUrl.includes('webtoons.com') || lowerSource.includes('webtoon') || lowerSource.includes('line')) {
    platform = 'WEBTOONS';
  } else if (lowerUrl.includes('mangaplus') || lowerSource.includes('mangaplus')) {
    platform = 'MANGA Plus';
  } else if (lowerUrl.includes('kakao') || lowerSource.includes('kakao')) {
    platform = 'KAKAOPAGE';
  } else if (lowerUrl.includes('websunday') || lowerUrl.includes('shogakukan') || lowerSource.includes('shogakukan')) {
    platform = 'SHOGAKUKAN';
  } else if (lowerUrl.includes('comic.naver.com') || lowerSource.includes('naver')) {
    platform = 'NAVER WEBTOON';
  } else if (lowerUrl.includes('mangago') || lowerSource.includes('mangago')) {
    platform = 'MANGAGO';
  } else if (lowerType === 'anime' || lowerUrl.includes('anilist') || lowerUrl.includes('myanimelist')) {
    platform = 'ANILIST';
  } else if (item.sourceName && item.sourceName.trim().length > 0) {
    platform = item.sourceName.replace(/SYNC|OFFICIAL|LICENSED/gi, '').trim() || 'SOURCE';
  }

  const isAnime = lowerType === 'anime';
  const actionPrefix = isAnime ? 'WATCH ON' : 'READ ON';
  const label = `${actionPrefix} ${platform.toUpperCase()} ↗`;

  // Fallback search URL if sourceLink is empty
  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${item.title} ${item.tipe || 'manga'} baca`
  )}`;

  return {
    label,
    platform,
    url: url.trim().length > 0 ? url : fallbackUrl,
  };
}

/**
 * Safely opens the external URL
 */
export async function openItemLink(item: CatalogItem) {
  const { url, platform } = getReadOnInfo(item);
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported || url.startsWith('http')) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Tautan Eksternal', `Membuka di browser:\n${url}`);
    }
  } catch (error) {
    Alert.alert(
      'Gagal Membuka Tautan',
      `Tidak dapat membuka tautan ke ${platform}:\n${url}`
    );
  }
}
