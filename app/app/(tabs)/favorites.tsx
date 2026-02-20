import { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useOfflineArticles } from '../../hooks/useOfflineArticles';
import ArticleCard from '../../components/ArticleCard';
import { Spacing, FontSize } from '../../constants/theme';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { articles, loading, refresh } = useOfflineArticles();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              style={styles.center}
              size="large"
              color={colors.primary}
            />
          ) : (
            <View style={styles.center}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Žádné uložené články
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Články si můžete uložit pro offline čtení z detailu článku.
              </Text>
            </View>
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
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
