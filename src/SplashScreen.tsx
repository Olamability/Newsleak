import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export const SplashScreenComponent: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => onFinish?.(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#044d40" />
      <Text style={styles.logo}>🗞️</Text>
      <Text style={styles.title}>Newsleak</Text>
      <Text style={styles.subtitle}>The Smart News Feed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#044d40',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  logo: { fontSize: 90, marginBottom: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#ffd700' },
});
