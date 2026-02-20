import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { LANGUAGES } from '../constants/categories';

interface LanguageFilterProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function LanguageFilter({ selected, onSelect }: LanguageFilterProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {LANGUAGES.map((lang) => {
        const isSelected = lang.key === selected;
        return (
          <Pressable
            key={lang.key}
            onPress={() => onSelect(lang.key)}
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
              {lang.label}
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
