const fs = require('fs');
const path = require('path');

function getEnvFallback() {
  const envPath = path.resolve(__dirname, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          env[key] = val;
        }
      }
    } catch (_) {}
  }
  return env;
}

// Dynamic Expo Config: reads secrets and Google Client ID from .env
module.exports = ({ config }) => {
  const envFallback = getEnvFallback();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || envFallback.EXPO_PUBLIC_API_URL || '';
  const localApiUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL || envFallback.EXPO_PUBLIC_LOCAL_API_URL || '';
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || envFallback.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
  const prefix = googleClientId ? googleClientId.split('.')[0] : '';
  const dynamicIosScheme = prefix ? `com.googleusercontent.apps.${prefix}` : undefined;

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
      localApiUrl,
      googleClientId,
    },
    plugins: (config.plugins || []).map((plugin) => {
      // Injects iosUrlScheme dynamically if Google Sign-In plugin is configured
      if (plugin === '@react-native-google-signin/google-signin' && dynamicIosScheme) {
        return [
          '@react-native-google-signin/google-signin',
          {
            iosUrlScheme: dynamicIosScheme,
          },
        ];
      }
      return plugin;
    }),
  };
};
