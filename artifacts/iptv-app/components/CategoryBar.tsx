import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Category {
  id: string;
  name: string;
}

interface CategoryBarProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  allLabel?: string;
}

export function CategoryBar({
  categories,
  selectedId,
  onSelect,
  allLabel = 'All',
}: CategoryBarProps) {
  const colors = useColors();

  const items: Category[] = [{ id: '__all', name: allLabel }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={[styles.root, { borderBottomColor: colors.border }]}
    >
      {items.map(cat => {
        const isActive = cat.id === '__all' ? selectedId === null : selectedId === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id === '__all' ? null : cat.id)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.primary : colors.secondary,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? '#fff' : colors.mutedForeground,
                  fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                },
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    maxHeight: 54,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
  },
});
