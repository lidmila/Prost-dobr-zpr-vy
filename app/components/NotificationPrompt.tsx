import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface NotificationPromptProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function NotificationPrompt({ visible, onAccept, onDismiss }: NotificationPromptProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Ve světě se dějí dobré věci!
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Chcete dostávat upozornění na nové pozitivní zprávy?
          </Text>

          <Pressable
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={onAccept}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.acceptText}>Ano, chci!</Text>
          </Pressable>

          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={[styles.dismissText, { color: colors.textMuted }]}>
              Teď ne
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  acceptText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  dismissButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dismissText: {
    fontSize: FontSize.sm,
  },
});
