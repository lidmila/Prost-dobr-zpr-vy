import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useArticles } from '../../hooks/useArticles';
import ArticleCard from '../../components/ArticleCard';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { articles, loading, hasMore, setFilter, loadMore } = useArticles();
  const [query, setQuery] = useState('');

  const onSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length >= 2) {
        setFilter('search', text);
      } else if (text.length === 0) {
        setFilter('search', '');
      }
    },
    [setFilter]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.accent,
            },
          ]}
          placeholder="Hledat zprávy..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={onSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => router.push(`/article/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => hasMore && !loading && loadMore()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading && query.length >= 2 ? (
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Žádné výsledky pro "{query}"
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    padding: Spacing.md,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  list: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  center: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
