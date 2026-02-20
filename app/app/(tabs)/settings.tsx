import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { storage } from '../../services/storage';
import { useNotifications } from '../../hooks/useNotifications';
import { LANGUAGES, LOCATIONS } from '../../constants/categories';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { registerForPushNotifications } = useNotifications();

  const [preferredLang, setPreferredLang] = useState('all');
  const [preferredLocation, setPreferredLocation] = useState('all');
  const [showAdult, setShowAdult] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      setPreferredLang(await storage.getPreferredLanguage());
      setPreferredLocation(await storage.getPreferredLocation());
      setShowAdult(await storage.getShowAdult());
    })();
  }, []);

  const onLanguageChange = useCallback(async (lang: string) => {
    setPreferredLang(lang);
    await storage.setPreferredLanguage(lang);
  }, []);

  const onLocationChange = useCallback(async (loc: string) => {
    setPreferredLocation(loc);
    await storage.setPreferredLocation(loc);
  }, []);

  const onAdultToggle = useCallback(async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Obsah pro dospělé',
        'Potvrzujete, že je vám 18 a více let?',
        [
          { text: 'Ne', style: 'cancel' },
          {
            text: 'Ano',
            onPress: async () => {
              setShowAdult(true);
              await storage.setShowAdult(true);
            },
          },
        ]
      );
    } else {
      setShowAdult(false);
      await storage.setShowAdult(false);
    }
  }, []);

  const onNotificationsToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const token = await registerForPushNotifications();
        setNotificationsEnabled(!!token);
      } else {
        setNotificationsEnabled(false);
      }
    },
    [registerForPushNotifications]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Preferovaný jazyk
      </Text>
      <View style={styles.optionRow}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.key}
            style={[
              styles.pill,
              {
                backgroundColor:
                  preferredLang === lang.key ? colors.primary : colors.surface,
                borderColor:
                  preferredLang === lang.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onLanguageChange(lang.key)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    preferredLang === lang.key ? '#fff' : colors.text,
                },
              ]}
            >
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Preferovaná lokace
      </Text>
      <View style={styles.optionRow}>
        {LOCATIONS.map((loc) => (
          <Pressable
            key={loc.key}
            style={[
              styles.pill,
              {
                backgroundColor:
                  preferredLocation === loc.key
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  preferredLocation === loc.key
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={() => onLocationChange(loc.key)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    preferredLocation === loc.key ? '#fff' : colors.text,
                },
              ]}
            >
              {loc.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Obsah 18+
          </Text>
          <Text
            style={[styles.settingDescription, { color: colors.textSecondary }]}
          >
            Zobrazit články s obsahem pro dospělé
          </Text>
        </View>
        <Switch
          value={showAdult}
          onValueChange={onAdultToggle}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Notifikace
          </Text>
          <Text
            style={[styles.settingDescription, { color: colors.textSecondary }]}
          >
            Denní upozornění na nové zprávy
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={onNotificationsToggle}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <View style={styles.about}>
        <Text style={[styles.aboutText, { color: colors.primary }]}>
          Prostě dobrý zprávy v1.0.0
        </Text>
        <Text style={[styles.aboutText, { color: colors.textMuted }]}>
          Pozitivní zprávy z českých i světových zdrojů
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  about: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aboutText: {
    fontSize: FontSize.sm,
  },
});
