import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getBackendHost } from '../services/api';

export function LoginScreen() {
  const {
    signInWithGoogle,
    signInAsWhitelistedOwner,
    loginWithGoogleCredential,
    testWhitelistReject,
    isLoading,
    error,
    clearError,
    backendOnline,
    whitelistedEmail,
    isNativeGoogleSignIn,
  } = useAuth();

  const [showSecurityTest, setShowSecurityTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingReject, setIsTestingReject] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // 1. Primary Google Sign-In (prompts Google picker on device)
  const handleGoogleSignInPress = async () => {
    clearError();
    const ok = await signInWithGoogle();
    if (ok) {
      Alert.alert(
        'Login Berhasil ⚡',
        `Selamat datang kembali!\nAkun Google '${whitelistedEmail}' telah diverifikasi oleh sistem whitelist Notion Vault.`
      );
    }
  };

  // 2. Direct Whitelist Owner Sign-In (Guaranteed access for aryadzaky8494@gmail.com)
  const handleOwnerDirectSignIn = async () => {
    clearError();
    const ok = await signInAsWhitelistedOwner();
    if (ok) {
      Alert.alert(
        'Login Berhasil ⚡',
        `Selamat datang kembali!\nMasuk langsung sebagai ${whitelistedEmail}.`
      );
    }
  };

  // 3. Test Non-Whitelisted Account (Demonstrates 403 Forbidden Rejection)
  const handleTestNonWhitelistedAccount = async () => {
    const emailToTest = testEmail.trim().toLowerCase();
    if (!emailToTest) {
      Alert.alert('Perhatian', 'Ketik alamat email lain untuk menguji proteksi whitelist.');
      return;
    }
    clearError();
    setIsTestingReject(true);
    try {
      const res = await testWhitelistReject(emailToTest);
      if (!res.success) {
        Alert.alert(
          '🚫 403 Forbidden (Akses Ditolak)',
          `Email '${emailToTest}' ditolak!\n\n${res.message}\n\nHanya email '${whitelistedEmail}' yang diizinkan mengakses Notion Database #MN-2026.`
        );
      } else {
        Alert.alert('Hasil Pengujian', res.message);
      }
    } finally {
      setIsTestingReject(false);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) return;
    clearError();
    await loginWithGoogleCredential(manualToken.trim());
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Breadcrumb Top Bar (Mirip Frontend Web) */}
      <View style={styles.breadcrumbBar}>
        <Text style={styles.breadcrumbIcon}>📚</Text>
        <Text style={styles.breadcrumbTitle}>Catalog Database</Text>
        <Text style={styles.breadcrumbSlash}>/</Text>
        <Text style={styles.breadcrumbSub}>Vault Authentication</Text>
      </View>

      {/* 2. Central Login Card (Mirip Frontend LoginPage) */}
      <View style={styles.loginCard}>
        {/* App Emblem Header */}
        <View style={styles.cardHeader}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>📖</Text>
          </View>
          <Text style={styles.appTitle}>Notion Tracker Vault</Text>
          <Text style={styles.appSubtitle}>
            Database Katalog Pribadi Manhwa, Manga & Anime
          </Text>
        </View>

        {/* Whitelist Account Badge (Mirip Frontend Notice) */}
        <View style={styles.whitelistNoticeBox}>
          <View style={styles.whitelistIconWrapper}>
            <Text style={styles.whitelistNoticeIcon}>🔒</Text>
          </View>
          <View style={styles.whitelistNoticeContent}>
            <Text style={styles.whitelistNoticeHeading}>
              AKUN GOOGLE TERDAFTAR (WHITELIST)
            </Text>
            <Text style={styles.whitelistNoticeEmail}>{whitelistedEmail}</Text>
            <Text style={styles.whitelistNoticeDesc}>
              Hanya email resmi di atas yang memiliki izin akses ke database Notion #MN-2026.
            </Text>
          </View>
        </View>

        {/* Error Alert Box (Mirip Frontend errorMessage) */}
        {error && (
          <View style={styles.errorAlertBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <View style={styles.errorContentCol}>
              <Text style={styles.errorHeading}>
                {error.includes('DEVELOPER_ERROR')
                  ? 'Konfigurasi Google Cloud (DEVELOPER_ERROR)'
                  : 'Autentikasi Gagal'}
              </Text>
              <Text style={styles.errorDesc}>
                {error.includes('DEVELOPER_ERROR')
                  ? 'SHA-1 fingerprint aplikasi belum didaftarkan di Google Cloud Console untuk package com.aryadzaky.animenotionvault. Silakan gunakan tombol Masuk Langsung di bawah.'
                  : error}
              </Text>
              {error.includes('DEVELOPER_ERROR') && (
                <TouchableOpacity
                  style={styles.errorActionBtn}
                  onPress={handleOwnerDirectSignIn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.errorActionBtnText}>
                    ⚡ Masuk Langsung sebagai {whitelistedEmail}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={clearError} style={styles.errorCloseBtn}>
              <Text style={styles.errorCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Primary Official Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googlePrimaryBtn}
          onPress={handleGoogleSignInPress}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View style={styles.btnLoadingRow}>
              <ActivityIndicator color="#171717" size="small" />
              <Text style={styles.googleBtnText}>Memverifikasi akun Google...</Text>
            </View>
          ) : (
            <View style={styles.btnContentRow}>
              <View style={styles.googleCircle}>
                <Text style={styles.googleGLetter}>G</Text>
              </View>
              <View style={styles.googleTextGroup}>
                <Text style={styles.googleBtnTitle}>Masuk dengan Google</Text>
                <Text style={styles.googleBtnSubtitle}>
                  {isNativeGoogleSignIn ? 'Pilih akun Google Anda' : `Lanjutkan sebagai ${whitelistedEmail}`}
                </Text>
              </View>
              <Text style={styles.googleArrowIcon}>→</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 4. Secondary Quick Owner Login Button */}
        <TouchableOpacity
          style={styles.ownerQuickBtn}
          onPress={handleOwnerDirectSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.ownerQuickIcon}>⚡</Text>
          <Text style={styles.ownerQuickText}>
            Lanjutkan Langsung sebagai {whitelistedEmail}
          </Text>
        </TouchableOpacity>

        {/* 5. Server Status Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaKey}>STATUS SERVER:</Text>
          <Text style={[styles.metaValue, backendOnline ? styles.textGreen : styles.textOrange]}>
            {backendOnline ? `● Connected (${getBackendHost()})` : '○ Menghubungkan Backend...'}
          </Text>
        </View>

        {/* 6. Whitelist Security Test Section */}
        <TouchableOpacity
          style={styles.toggleTestBtn}
          onPress={() => setShowSecurityTest(!showSecurityTest)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleTestText}>
            {showSecurityTest
              ? '▴ Sembunyikan Uji Keamanan Whitelist'
              : '▾ Uji Keamanan: Coba Login Akun Selain Whitelist (403 Test)'}
          </Text>
        </TouchableOpacity>

        {showSecurityTest && (
          <View style={styles.testSectionContainer}>
            <Text style={styles.testInstruction}>
              Uji keamanan backend: Ketik alamat email lain untuk membuktikan penolakan 403 Forbidden:
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.testTextInput}
                placeholder="Contoh: bukanarya@gmail.com"
                placeholderTextColor="#888888"
                value={testEmail}
                onChangeText={setTestEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={styles.testActionBtn}
                onPress={handleTestNonWhitelistedAccount}
                disabled={isTestingReject}
              >
                {isTestingReject ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.testActionBtnText}>Uji 403</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.testInstruction, { marginTop: 12 }]}>
              Atau tempel Google ID Token manual (JWT) jika ada:
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.testTextInput, { fontSize: 10 }]}
                placeholder="eyJhbGciOi..."
                placeholderTextColor="#888888"
                value={manualToken}
                onChangeText={setManualToken}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.testActionBtn}
                onPress={handleManualTokenSubmit}
                disabled={isLoading}
              >
                <Text style={styles.testActionBtnText}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 7. Footer (Mirip Frontend) */}
      <View style={styles.footerSection}>
        <Text style={styles.footerShield}>🛡️</Text>
        <Text style={styles.footerText}>
          NOTION TRACKER VAULT · 30-DAY SECURE SESSION · NOTION BRIDGE
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  // Breadcrumb
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  breadcrumbIcon: {
    fontSize: 16,
  },
  breadcrumbTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444444',
  },
  breadcrumbSlash: {
    fontSize: 12,
    color: '#888888',
  },
  breadcrumbSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
  },
  // Central Login Card
  loginCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#171717',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: '#171717',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 30,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  // Whitelist Notice
  whitelistNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F6F0',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D8D3C5',
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  whitelistIconWrapper: {
    marginTop: 2,
  },
  whitelistNoticeIcon: {
    fontSize: 16,
  },
  whitelistNoticeContent: {
    flex: 1,
  },
  whitelistNoticeHeading: {
    fontSize: 9,
    fontWeight: '900',
    color: '#777777',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  whitelistNoticeEmail: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
    marginBottom: 3,
  },
  whitelistNoticeDesc: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 14,
  },
  // Error Alert Box
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  errorContentCol: {
    flex: 1,
  },
  errorHeading: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B91C1C',
    marginBottom: 2,
  },
  errorDesc: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 15,
  },
  errorActionBtn: {
    marginTop: 8,
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  errorActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  errorCloseBtn: {
    padding: 4,
  },
  errorCloseText: {
    fontSize: 14,
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  // Primary Official Google Sign-In Button
  googlePrimaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D3C5',
  },
  googleGLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA4335',
  },
  googleTextGroup: {
    flex: 1,
  },
  googleBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
  },
  googleBtnSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  googleArrowIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#171717',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  googleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#171717',
  },
  // Secondary Owner Quick Sign-In
  ownerQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5BA13',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 6,
  },
  ownerQuickIcon: {
    fontSize: 13,
  },
  ownerQuickText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#171717',
  },
  // Meta Server Row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#EAE6DC',
    marginBottom: 10,
  },
  metaKey: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777777',
  },
  metaValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  textGreen: {
    color: '#16A34A',
  },
  textOrange: {
    color: '#EA580C',
  },
  // Toggle Test Section
  toggleTestBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleTestText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    textDecorationLine: 'underline',
  },
  testSectionContainer: {
    backgroundColor: '#F8F6F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8D3C5',
    padding: 12,
    marginTop: 6,
  },
  testInstruction: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testTextInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C5C0B3',
    paddingHorizontal: 10,
    fontSize: 11,
    color: '#171717',
  },
  testActionBtn: {
    backgroundColor: '#171717',
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  testActionBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // Footer
  footerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerShield: {
    fontSize: 12,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 0.6,
  },
});
