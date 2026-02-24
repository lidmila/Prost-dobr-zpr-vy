import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/6oUaIU2oP3fW2cw000';
const CONTACT_EMAIL = 'hello@codewhiskers.app';
const logo = require('../../assets/logo.png');

export default function SupportScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={[styles.logoTitle, { color: colors.text }]}>
          Prostě dobrý zprávy
        </Text>
      </View>

      <View style={[styles.supportCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
        <Ionicons name="heart" size={48} color={colors.primary} />
        <Text style={[styles.supportTitle, { color: colors.primary }]}>
          Podpořte tento projekt
        </Text>
        <Text style={[styles.supportDescription, { color: colors.text }]}>
          Aplikace je zcela zdarma a bez reklam. Vývoj a provoz serveru ale
          něco stojí. Pokud se vám aplikace líbí, můžete nás podpořit
          jednorázovým příspěvkem.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.supportButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(STRIPE_PAYMENT_URL)}
        >
          <Ionicons name="heart" size={18} color="#fff" />
          <Text style={styles.supportButtonText}>Podpořte nás</Text>
        </Pressable>
        <Text style={[styles.supportNote, { color: colors.textSecondary }]}>
          Platba probíhá bezpečně přes Stripe
        </Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="megaphone-outline" size={28} color={colors.primary} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          Chcete tady být vidět?
        </Text>
        <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
          Vyskytují se u vás dobré zprávy, ale nejste u nás vidět? Napište nám,
          ať vás přidáme!
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.infoButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Chci být vidět v aplikaci`)}
        >
          <Ionicons name="mail-outline" size={16} color="#fff" />
          <Text style={styles.infoButtonText}>Kontaktovat</Text>
        </Pressable>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.primary} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          Máte nápad nebo zpětnou vazbu?
        </Text>
        <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
          Budeme rádi za jakýkoli podnět — ať už jde o chybu, návrh na
          vylepšení, nebo jen pochvalu.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.infoButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Zpětná vazba k aplikaci`)}
        >
          <Ionicons name="mail-outline" size={16} color="#fff" />
          <Text style={styles.infoButtonText}>Napsat nám</Text>
        </Pressable>
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
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  logoTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  supportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  supportTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  supportDescription: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  supportNote: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  infoDescription: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
