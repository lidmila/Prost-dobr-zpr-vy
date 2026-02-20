import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { LOCATIONS } from '../constants/categories';

interface LocationToggleProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function LocationToggle({ selected, onSelect }: LocationToggleProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {LOCATIONS.map((loc) => {
        const isSelected = loc.key === selected;
        return (
          <Pressable
            key={loc.key}
            onPress={() => onSelect(loc.key)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: isSelected ? colors.primary : 'transparent',
                borderColor: isSelected ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {loc.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
