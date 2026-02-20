import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getImageProxyUrl } from '../services/api';
import type { Article } from '../services/api';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'právě teď';
  if (diffMin < 60) return `před ${diffMin}m`;
  if (diffH < 24) return `před ${diffH}h`;
  if (diffD < 30) return `před ${diffD}d`;
  return new Date(dateString).toLocaleDateString('cs-CZ');
}

function getSourceColor(name: string): string {
  const colors = [
    '#f6a6b2', '#90d2d8', '#f7c297', '#b7ded2',
    '#ffecb8', '#e0899a', '#6bb8c2', '#8cc5b7',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function ArticleCard({ article, onPress }: ArticleCardProps) {
  const { colors } = useTheme();

  const relativeTime = useMemo(
    () => getRelativeTime(article.published_at),
    [article.published_at],
  );

  const fallbackColor = useMemo(
    () => getSourceColor(article.source_name),
    [article.source_name],
  );

  const langBadgeColors: Record<string, { bg: string; text: string }> = {
    cs: { bg: '#d4f0f3', text: '#4a9aa1' },
    sk: { bg: '#fde8ec', text: '#c97585' },
    en: { bg: '#e8f5e4', text: '#6ba362' },
    de: { bg: '#fff3d6', text: '#b89840' },
  };
  const langStyle = langBadgeColors[article.language] ?? {
    bg: colors.primaryLight,
    text: colors.primary,
  };

  const [imageError, setImageError] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {article.image_url && !imageError ? (
        <Image
          source={{ uri: getImageProxyUrl(article.image_url) }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.imageFallback, { backgroundColor: fallbackColor }]}>
          <Text style={styles.imageFallbackText}>
            {article.source_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {article.title}
        </Text>

        {article.description ? (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {article.description}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={[styles.source, { color: colors.textMuted }]}>
            {article.source_name}
          </Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>{' \u00B7 '}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {relativeTime}
          </Text>

          <View
            style={[
              styles.languageBadge,
              { backgroundColor: langStyle.bg },
            ]}
          >
            <Text style={[styles.languageText, { color: langStyle.text }]}>
              {article.language.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imageFallback: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    lineHeight: 24,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  source: {
    fontSize: FontSize.xs,
  },
  dot: {
    fontSize: FontSize.xs,
  },
  time: {
    fontSize: FontSize.xs,
  },
  languageBadge: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  languageText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
