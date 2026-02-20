import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius, Palette } from '../constants/theme';
import { CATEGORIES } from '../constants/categories';

const PILL_COLORS = [
  Palette.rose, Palette.sage, Palette.cyan, Palette.peach,
  Palette.cream, Palette.roseDark, Palette.cyanDark, Palette.sageDark,
  Palette.rose, Palette.cyan,
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat, index) => {
        const isSelected = cat.key === selected;
        const pillColor = PILL_COLORS[index % PILL_COLORS.length];
        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: isSelected ? pillColor : 'transparent',
                borderColor: isSelected ? pillColor : colors.border,
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
              {cat.label}
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
