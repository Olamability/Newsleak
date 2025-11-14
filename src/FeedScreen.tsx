// mobile/src/FeedScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Article {
  id: string;
  title: string;
  snippet: string;
  link: string;
  thumbnail?: string;
  source: string;
}

interface SectionData {
  title: string; // category name
  data: Article[];
}

interface Props {
  language?: string;
}

/**
 * RSS sources list.
 * Add/remove or replace with your preferred RSS URLs.
 */
const RSS_SOURCES: { category: string; url: string }[] = [
  { category: 'World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { category: 'Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
  { category: 'Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
  { category: 'Sports', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml' },
  { category: 'Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml' },
];

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';

export const FeedScreen: React.FC<Props> = ({ language = 'en' }) => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllFeeds();
  }, []);

  const cacheKeyForCategory = (category: string) => `news_cache_${category}`;

  const fetchFeedAsJson = async (feedUrl: string) => {
    try {
      const url = `${RSS2JSON_ENDPOINT}${encodeURIComponent(feedUrl)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network response not ok (${res.status})`);
      const json = await res.json();
      return json.items || [];
    } catch (err) {
      console.warn('fetchFeedAsJson error for', feedUrl, err);
      throw err;
    }
  };

  const fetchAllFeeds = async () => {
    setLoading(true);
    try {
      const allSections: SectionData[] = [];

      for (const source of RSS_SOURCES) {
        try {
          // Try network first
          const items = await fetchFeedAsJson(source.url);

          // Map items to our Article shape (take top 10)
          const articles: Article[] = (items || []).slice(0, 12).map((item: any, idx: number) => ({
            id: `${source.category}-${idx}-${(item.guid || item.link || '').slice(-8)}`,
            title: item.title || 'No title',
            snippet:
              (item.description || item.content || '')
                .replace(/<[^>]+>/g, '')
                .slice(0, 220) || '',
            link: item.link || '',
            thumbnail: item.thumbnail || item.enclosure?.link || undefined,
            source: source.category,
          }));

          // Save to cache
          try {
            await AsyncStorage.setItem(cacheKeyForCategory(source.category), JSON.stringify(articles));
          } catch (e) {
            // cache fail is non-fatal
            console.warn('Cache save failed', e);
          }

          allSections.push({ title: source.category, data: articles });
        } catch (err) {
          // On error, try loading cached version
          try {
            const cached = await AsyncStorage.getItem(cacheKeyForCategory(source.category));
            if (cached) {
              const parsed: Article[] = JSON.parse(cached);
              allSections.push({ title: source.category, data: parsed });
            } else {
              // push empty list to maintain ordering
              allSections.push({ title: source.category, data: [] });
            }
          } catch (e) {
            allSections.push({ title: source.category, data: [] });
          }
        }
      }

      setSections(allSections);
    } catch (err) {
      console.error('fetchAllFeeds error', err);
      Alert.alert('Network error', 'Failed to fetch some feeds. Showing cached content if available.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllFeeds();
  };

  if (loading) return <ActivityIndicator size="large" color="#044d40" style={{ marginTop: 50 }} />;

  const openLink = (url: string) => {
    if (!url) return Alert.alert('No link', 'No article link available.');
    Linking.openURL(url).catch((err) => {
      console.error('openLink error', err);
      Alert.alert('Failed to open', 'Unable to open the article link.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openLink(item.link)}>
            <Text style={styles.title}>{item.title}</Text>
            {item.snippet ? <Text style={styles.snippet}>{item.snippet}</Text> : null}
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) =>
          title ? <Text style={styles.categoryHeader}>{title}</Text> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: '#666' }}>No articles available.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  categoryHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#044d40',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  snippet: { fontSize: 14, color: '#333' },
  empty: { padding: 32, alignItems: 'center' },
});
