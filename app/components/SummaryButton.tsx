import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface SummaryButtonProps {
  onPress: () => void;
  loading: boolean;
  summarized: boolean;
}

export default function SummaryButton({ onPress, loading, summarized }: SummaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: summarized ? colors.accentLight : 'transparent',
          borderColor: colors.accent,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons
          name="sparkles-outline"
          size={18}
          color={colors.accent}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: colors.accent }]}>
        {summarized ? 'Shrnutí načteno' : 'AI shrnutí'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
