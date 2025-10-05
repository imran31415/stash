import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks';
import { spacing, typography, borderRadius } from '../tokens';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  containerStyle,
  autoFocus = false,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: colors.surface },
        containerStyle,
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7}>
          <Text style={[styles.searchClear, { color: colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.base,
  },
  searchIcon: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    paddingVertical: 4,
  },
  searchClear: {
    fontSize: typography.fontSize.xl,
    paddingLeft: spacing.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
