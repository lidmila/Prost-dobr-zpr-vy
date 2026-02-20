import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface AgeGateModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgeGateModal({ visible, onConfirm, onCancel }: AgeGateModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Obsah 18+
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Tento článek může obsahovat obsah pro dospělé. Pokračovat?
          </Text>

          <View style={styles.buttons}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  borderColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.accent }]}>
                Zpět
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Ano, pokračovat
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
