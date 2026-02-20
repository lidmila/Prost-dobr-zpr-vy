import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { api, getImageProxyUrl, Article } from '../../services/api';
import { offlineDb } from '../../services/database';
import AgeGateModal from '../../components/AgeGateModal';
import TranslateButton from '../../components/TranslateButton';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Try offline first
        const offline = await offlineDb.getArticle(id);
        if (offline) {
          setArticle(offline);
          setIsSaved(true);
        } else {
          const data = await api.getArticle(id);
          setArticle(data);
        }
        const saved = await offlineDb.isArticleSaved(id);
        setIsSaved(saved);
      } catch {
        // If API fails, article stays null
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (article?.is_adult && !ageConfirmed) {
      setShowAgeGate(true);
    }
  }, [article, ageConfirmed]);

  const toggleSave = useCallback(async () => {
    if (!article) return;
    if (isSaved) {
      await offlineDb.removeArticle(article.id);
      setIsSaved(false);
    } else {
      await offlineDb.saveArticle(article);
      setIsSaved(true);
    }
  }, [article, isSaved]);

  const handleTranslate = useCallback(async () => {
    if (!article) return;
    setTranslating(true);
    try {
      const text = article.content || article.description || article.title;
      const result = await api.translate(text, 'cs', article.language);
      setTranslatedText(result.translatedText);
    } catch {
      // Translation failed silently
    } finally {
      setTranslating(false);
    }
  }, [article]);

  const openOriginal = useCallback(() => {
    if (article?.url) {
      Linking.openURL(article.url);
    }
  }, [article]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Článek nenalezen</Text>
      </View>
    );
  }

  if (article.is_adult && !ageConfirmed) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AgeGateModal
          visible={showAgeGate}
          onConfirm={() => {
            setAgeConfirmed(true);
            setShowAgeGate(false);
          }}
          onCancel={() => {
            setShowAgeGate(false);
          }}
        />
      </View>
    );
  }

  const displayContent = translatedText || article.content || article.description;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {article.image_url && !imageError ? (
        <Image
          source={{ uri: getImageProxyUrl(article.image_url) }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.imageFallback, { backgroundColor: colors.surface }]}>
          <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={[styles.source, { color: colors.primary }]}>
            {article.source_name}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(article.published_at).toLocaleDateString('cs-CZ')}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {article.title}
        </Text>

        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {article.language.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {article.category}
            </Text>
          </View>
        </View>

        {displayContent ? (
          <Text style={[styles.contentText, { color: colors.text }]}>
            {displayContent}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {article.language !== 'cs' ? (
            <TranslateButton
              onPress={handleTranslate}
              loading={translating}
              translated={!!translatedText}
            />
          ) : null}

          <Pressable
            style={[styles.actionButton, {
              backgroundColor: isSaved ? colors.primaryLight : colors.surface,
              borderColor: isSaved ? colors.primary : colors.border,
            }]}
            onPress={toggleSave}
          >
            <Ionicons
              name={isSaved ? 'download' : 'download-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.actionText, { color: isSaved ? colors.primary : colors.text }]}>
              {isSaved ? 'Uloženo' : 'Uložit offline'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
            onPress={openOriginal}
          >
            <Ionicons name="open-outline" size={20} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>
              Originál
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  imageFallback: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: Spacing.md,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  source: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  date: {
    fontSize: FontSize.xs,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: Spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  contentText: {
    fontSize: FontSize.md,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
