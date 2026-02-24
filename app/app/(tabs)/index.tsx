import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useArticles } from '../../hooks/useArticles';
import ArticleCard from '../../components/ArticleCard';
import CategoryFilter from '../../components/CategoryFilter';
import CompactFilters from '../../components/CompactFilters';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function FeedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    articles,
    loading,
    error,
    hasMore,
    filters,
    setFilter,
    refresh,
    loadMore,
  } = useArticles();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

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

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilter('search', '');
  }, [setFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Hledat zprávy..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={onSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <CategoryFilter
          selected={filters.category}
          onSelect={(v) => setFilter('category', v)}
        />
        <CompactFilters
          selectedRegion={filters.region}
          onRegionSelect={(v) => setFilter('region', v)}
          selectedTimeRange={filters.timeRange}
          onTimeRangeSelect={(v) => setFilter('timeRange', v)}
        />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      ) : null}

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && articles.length > 0 ? (
            <ActivityIndicator
              style={styles.footer}
              color={colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {query.length >= 2
                  ? `Žádné výsledky pro "${query}"`
                  : 'Žádné zprávy k zobrazení'}
              </Text>
              <Text style={[styles.pullHint, { color: colors.textMuted }]}>
                Potažením dolů aktualizujete
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              style={styles.center}
              size="large"
              color={colors.primary}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xs,
    gap: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    height: '100%',
    paddingVertical: 0,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
  pullHint: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
});
