import React from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { REGIONS, TIME_RANGES } from '../constants/categories';

interface CompactFiltersProps {
  selectedRegion: string;
  onRegionSelect: (key: string) => void;
  selectedTimeRange: string;
  onTimeRangeSelect: (key: string) => void;
}

export default function CompactFilters({
  selectedRegion,
  onRegionSelect,
  selectedTimeRange,
  onTimeRangeSelect,
}: CompactFiltersProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>Region:</Text>
      {REGIONS.map((r) => {
        const isSelected = r.key === selectedRegion;
        return (
          <Pressable
            key={r.key}
            onPress={() => onRegionSelect(r.key)}
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
              {r.label}
            </Text>
          </Pressable>
        );
      })}

      <View style={styles.separator} />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Období:</Text>
      {TIME_RANGES.map((t) => {
        const isSelected = t.key === selectedTimeRange;
        return (
          <Pressable
            key={t.key}
            onPress={() => onTimeRangeSelect(t.key)}
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
              {t.label}
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
    gap: Spacing.xs,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    width: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
