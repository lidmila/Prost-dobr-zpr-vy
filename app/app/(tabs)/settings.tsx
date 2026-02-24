import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { storage } from '../../services/storage';
import { useNotifications } from '../../hooks/useNotifications';
import { REGIONS } from '../../constants/categories';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { registerForPushNotifications } = useNotifications();

  const [preferredRegion, setPreferredRegion] = useState('all');
  const [showAdult, setShowAdult] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      setPreferredRegion(await storage.getPreferredRegion());
      setShowAdult(await storage.getShowAdult());
      setNotificationsEnabled(await storage.getNotificationsEnabled());
    })();
  }, []);

  const onRegionChange = useCallback(async (region: string) => {
    setPreferredRegion(region);
    await storage.setPreferredRegion(region);
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
        try {
          const token = await registerForPushNotifications();
          const enabled = !!token;
          setNotificationsEnabled(enabled);
          await storage.setNotificationsEnabled(enabled);
        } catch (err) {
          setNotificationsEnabled(false);
          await storage.setNotificationsEnabled(false);
          Alert.alert(
            'Notifikace',
            'Nepodařilo se zapnout notifikace. ' +
              (err instanceof Error ? err.message : 'Zkuste to znovu.')
          );
        }
      } else {
        setNotificationsEnabled(false);
        await storage.setNotificationsEnabled(false);
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
        Preferovaný region
      </Text>
      <View style={styles.optionRow}>
        {REGIONS.map((r) => (
          <Pressable
            key={r.key}
            style={[
              styles.pill,
              {
                backgroundColor:
                  preferredRegion === r.key ? colors.primary : colors.surface,
                borderColor:
                  preferredRegion === r.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onRegionChange(r.key)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    preferredRegion === r.key ? '#fff' : colors.text,
                },
              ]}
            >
              {r.label}
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
          {preferredRegion === 'world' ? 'Simply Good News v1.0.0' : 'Prostě dobrý zprávy v1.0.0'}
        </Text>
        <Text style={[styles.aboutText, { color: colors.textMuted }]}>
          {preferredRegion === 'world'
            ? 'Positive news from Czech and world sources'
            : 'Pozitivní zprávy z českých i světových zdrojů'}
        </Text>
      </View>

      <View style={styles.credits}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
          {preferredRegion === 'world'
            ? 'This app was created by Lidmila Maršálková and Josef Rousek. Simply because. For a better day.'
            : 'Aplikaci pro vás vytvořili Lidmila Maršálková a Josef Rousek. Prostě proto. Pro lepší den.'}
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
  credits: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  creditsText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
});
