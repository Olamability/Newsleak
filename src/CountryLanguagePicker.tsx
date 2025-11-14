import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = [
  { code: 'en', name: 'English', flag: require('../assets/flags/en.png') },
  { code: 'fr', name: 'French', flag: require('../assets/flags/fr.png') },
  { code: 'es', name: 'Spanish', flag: require('../assets/flags/es.png') },
  { code: 'ha', name: 'Hausa', flag: require('../assets/flags/ha.png') },
];

export const CountryLanguagePicker: React.FC<{ onSelect: (lang: string) => void }> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem('selectedLanguage', code);
    onSelect(code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.option, selected === item.code && styles.selected]}
            onPress={() => handleSelect(item.code)}
          >
            <Image source={item.flag} style={styles.flag} />
            <Text style={[styles.text, selected === item.code && { color: '#fff' }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 6, borderRadius: 8, backgroundColor: '#eee' },
  selected: { backgroundColor: '#044d40' },
  flag: { width: 32, height: 32, marginRight: 12 },
  text: { fontSize: 16, fontWeight: '600' },
});
