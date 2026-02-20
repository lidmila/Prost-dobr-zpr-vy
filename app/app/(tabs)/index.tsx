import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useArticles } from '../../hooks/useArticles';
import ArticleCard from '../../components/ArticleCard';
import CategoryFilter from '../../components/CategoryFilter';
import LanguageFilter from '../../components/LanguageFilter';
import LocationToggle from '../../components/LocationToggle';
import { Spacing, FontSize } from '../../constants/theme';

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <CategoryFilter
          selected={filters.category}
          onSelect={(v) => setFilter('category', v)}
        />
        <View style={styles.filterRow}>
          <LanguageFilter
            selected={filters.language}
            onSelect={(v) => setFilter('language', v)}
          />
        </View>
        <LocationToggle
          selected={filters.location}
          onSelect={(v) => setFilter('location', v)}
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
                Žádné zprávy k zobrazení
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
  filters: {
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
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
});
