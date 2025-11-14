import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreenComponent } from './src/SplashScreen';
import { CountryLanguagePicker } from './src/CountryLanguagePicker';
import { FeedScreen } from './src/FeedScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const lang = await AsyncStorage.getItem('selectedLanguage');
      if (!lang) setShowLanguage(true);
      else setLanguage(lang);
      setLoading(false);
    };

    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
      initApp();
    }, 2000);

    return () => clearTimeout(splashTimeout);
  }, []);

  const handleLanguageSelected = async (langCode: string) => {
    await AsyncStorage.setItem('selectedLanguage', langCode);
    setLanguage(langCode);
    setShowLanguage(false);
  };

  if (showSplash || loading) return <SplashScreenComponent />;

  if (showLanguage) return <CountryLanguagePicker onSelect={handleLanguageSelected} />;

  return <FeedScreen language={language || 'en'} />;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
