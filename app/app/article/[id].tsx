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
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { api, getImageProxyUrl, Article } from '../../services/api';
import { offlineDb } from '../../services/database';
import { storage } from '../../services/storage';
import { useNotifications } from '../../hooks/useNotifications';
import AgeGateModal from '../../components/AgeGateModal';
import TranslateButton from '../../components/TranslateButton';
import SummaryButton from '../../components/SummaryButton';
import NotificationPrompt from '../../components/NotificationPrompt';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/6oUaIU2oP3fW2cw000';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reported, setReported] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const { registerForPushNotifications } = useNotifications();

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

  useEffect(() => {
    if (!article) return;
    (async () => {
      const count = await storage.incrementArticlesReadCount();
      if (count === 1) {
        const prompted = await storage.getNotificationPromptShown();
        const enabled = await storage.getNotificationsEnabled();
        if (!prompted && !enabled) {
          setShowNotifPrompt(true);
        }
      }
    })();
  }, [article]);

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
      const [titleResult, contentResult] = await Promise.all([
        api.translate(article.title, 'cs', article.language),
        api.translate(text, 'cs', article.language),
      ]);
      setTranslatedTitle(titleResult.translatedText);
      setTranslatedText(contentResult.translatedText);
    } catch {
      Alert.alert('Chyba překladu', 'Překlad se nezdařil. Zkuste to prosím později.');
    } finally {
      setTranslating(false);
    }
  }, [article]);

  const handleSummarize = useCallback(async () => {
    if (!article || summary) return;
    setSummarizing(true);
    try {
      const text = article.content || article.description || article.title;
      const result = await api.summarize(text, article.language);
      setSummary(result.summary);
    } catch {
      Alert.alert('Chyba shrnutí', 'Shrnutí se nezdařilo. Zkuste to prosím později.');
    } finally {
      setSummarizing(false);
    }
  }, [article, summary]);

  const openOriginal = useCallback(() => {
    if (article?.url) {
      Linking.openURL(article.url);
    }
  }, [article]);

  const shareArticle = useCallback(async () => {
    if (!article?.url) return;
    try {
      await Share.share({
        message: article.url,
      });
    } catch {
      // User cancelled or share failed — ignore
    }
  }, [article]);

  const handleNotifAccept = useCallback(async () => {
    setShowNotifPrompt(false);
    await storage.setNotificationPromptShown(true);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await storage.setNotificationsEnabled(true);
      }
    } catch {
      // Permission denied or failed
    }
  }, [registerForPushNotifications]);

  const handleNotifDismiss = useCallback(async () => {
    setShowNotifPrompt(false);
    await storage.setNotificationPromptShown(true);
  }, []);

  const reportArticle = useCallback(() => {
    if (!article) return;
    const subject = encodeURIComponent(`Nahlášení článku: ${article.id}`);
    const body = encodeURIComponent(
      `Tento článek podle mě nepatří do aplikace:\n\n` +
      `Název: ${article.title}\n` +
      `Zdroj: ${article.source_name} (${article.source_domain})\n` +
      `Kategorie: ${article.category}\n` +
      `Jazyk: ${article.language}\n` +
      `URL: ${article.url}\n` +
      `ID: ${article.id}\n` +
      `Datum publikace: ${article.published_at}\n`
    );
    Linking.openURL(`mailto:hello@codewhiskers.app?subject=${subject}&body=${body}`);
    setReported(true);
    Alert.alert(
      'Děkujeme za pomoc!',
      'Chceme, aby byla aplikace příjemným prostorem plným dobrých zpráv. Na váš podnět se mrkneme do 24 hodin.',
      [{ text: 'OK' }]
    );
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
          {translatedTitle || article.title}
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

        <View style={styles.actions}>
          <SummaryButton
            onPress={handleSummarize}
            loading={summarizing}
            summarized={!!summary}
          />
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

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={shareArticle}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Sdílet
            </Text>
          </Pressable>

          <Pressable
            style={[styles.reportButton, {
              backgroundColor: reported ? colors.surface : 'transparent',
              borderColor: colors.border,
              opacity: reported ? 0.5 : 1,
            }]}
            onPress={reportArticle}
            disabled={reported}
          >
            <Ionicons name="flag-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.reportText, { color: colors.textMuted }]}>
              {reported ? 'Nahlášeno' : 'Myslím, že tento článek sem nepatří'}
            </Text>
          </Pressable>
        </View>

        {summary ? (
          <View style={[styles.summaryBox, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={[styles.summaryHeaderText, { color: colors.accent }]}>AI shrnutí</Text>
            </View>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {summary}
            </Text>
          </View>
        ) : null}

        {displayContent ? (
          <Text style={[styles.contentText, { color: colors.text }]}>
            {displayContent}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.supportBanner,
            { backgroundColor: colors.primaryLight, borderColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(STRIPE_PAYMENT_URL)}
        >
          <Ionicons name="heart" size={16} color={colors.primary} />
          <Text style={[styles.supportBannerText, { color: colors.primary }]}>
            Líbí se vám, co děláme? Podpořte nás!
          </Text>
        </Pressable>
      </View>

      <NotificationPrompt
        visible={showNotifPrompt}
        onAccept={handleNotifAccept}
        onDismiss={handleNotifDismiss}
      />
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
  summaryBox: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  summaryHeaderText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: FontSize.md,
    lineHeight: 24,
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
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  reportText: {
    fontSize: FontSize.xs,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  supportBannerText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
