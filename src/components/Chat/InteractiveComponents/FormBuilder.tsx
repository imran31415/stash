import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { FormBuilderProps, FormField, FormSection } from './FormBuilder.types';
import {
  calculateFormStats,
  validateField,
  getInitialValues,
  getFieldIcon,
  isFieldFilled,
} from './FormBuilder.utils';

export const FormBuilder: React.FC<FormBuilderProps> = ({
  data,
  mode = 'mini',
  height,
  width,
  values: externalValues,
  errors: externalErrors,
  onChange,
  onSubmit,
  onValidate,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';

  const [internalValues, setInternalValues] = useState<Record<string, any>>(() =>
    getInitialValues(data)
  );
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const values = externalValues || internalValues;
  const errors = externalErrors || internalErrors;

  const stats = useMemo(() => calculateFormStats(data, values), [data, values]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: any, field: FormField) => {
      const newValues = { ...values, [fieldId]: value };

      if (onChange) {
        onChange(fieldId, value);
      } else {
        setInternalValues(newValues);
      }

      // Clear error for this field if it exists
      if (errors[fieldId]) {
        const newErrors = { ...errors };
        delete newErrors[fieldId];
        if (!externalErrors) {
          setInternalErrors(newErrors);
        }
      }

      // Validate field on change
      if (field.validation) {
        const error = validateField(field, value);
        if (error && !externalErrors) {
          setInternalErrors({ ...errors, [fieldId]: error });
        }
      }
    },
    [values, errors, onChange, externalErrors]
  );

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const renderField = (field: FormField) => {
    const value = values[field.id];
    const error = errors[field.id];
    const isFilled = isFieldFilled(field, value);

    const commonInputStyle = [
      styles.input,
      {
        backgroundColor: colors.background,
        color: colors.text,
        borderColor: error ? '#EF4444' : colors.border,
      },
    ];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'tel':
        return (
          <TextInput
            style={commonInputStyle}
            value={value || ''}
            onChangeText={(text) => handleFieldChange(field.id, text, field)}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={field.type === 'password'}
            keyboardType={
              field.type === 'email'
                ? 'email-address'
                : field.type === 'tel'
                ? 'phone-pad'
                : field.type === 'url'
                ? 'url'
                : 'default'
            }
            editable={!field.disabled}
          />
        );

      case 'number':
        return (
          <TextInput
            style={commonInputStyle}
            value={value?.toString() || ''}
            onChangeText={(text) => {
              const num = parseFloat(text);
              handleFieldChange(field.id, isNaN(num) ? '' : num, field);
            }}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            editable={!field.disabled}
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[commonInputStyle, styles.textarea]}
            value={value || ''}
            onChangeText={(text) => handleFieldChange(field.id, text, field)}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={field.metadata?.rows || 4}
            editable={!field.disabled}
          />
        );

      case 'toggle':
        return (
          <View style={styles.toggleContainer}>
            <Switch
              value={value || false}
              onValueChange={(val) => handleFieldChange(field.id, val, field)}
              disabled={field.disabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? colors.primary : '#F3F4F6'}
            />
            <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
              {value ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        );

      case 'checkbox':
        return (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleFieldChange(field.id, !value, field)}
            disabled={field.disabled}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.border },
                value && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              {value && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              {field.placeholder || 'Check this box'}
            </Text>
          </TouchableOpacity>
        );

      case 'select':
        return (
          <View style={[commonInputStyle, styles.selectContainer]}>
            <Text style={{ color: value ? colors.text : colors.textSecondary }}>
              {value
                ? field.options?.find((opt) => opt.value === value)?.label || 'Select...'
                : field.placeholder || 'Select...'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </View>
        );

      case 'slider':
        const min = field.metadata?.min || 0;
        const max = field.metadata?.max || 100;
        const step = field.metadata?.step || 1;
        const sliderValue = value !== undefined ? value : min;

        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{min}</Text>
              <Text style={[styles.sliderValue, { color: colors.primary }]}>{sliderValue}</Text>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{max}</Text>
            </View>
            <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.sliderFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${((sliderValue - min) / (max - min)) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        );

      case 'rating':
        const maxRating = field.metadata?.max || 5;
        const rating = value || 0;

        return (
          <View style={styles.ratingContainer}>
            {Array.from({ length: maxRating }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleFieldChange(field.id, index + 1, field)}
                disabled={field.disabled}
              >
                <Text style={styles.star}>{index < rating ? '★' : '☆'}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {rating}/{maxRating}
            </Text>
          </View>
        );

      default:
        return (
          <Text style={[styles.unsupportedField, { color: colors.textSecondary }]}>
            Unsupported field type: {field.type}
          </Text>
        );
    }
  };

  const renderSection = (section: FormSection) => {
    const isCollapsed = section.collapsible && collapsedSections.has(section.id);
    const sectionFields = section.fields.slice(0, isMini ? 3 : undefined);

    return (
      <View key={section.id} style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => section.collapsible && toggleSection(section.id)}
          disabled={!section.collapsible}
        >
          <View style={styles.sectionHeaderContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            {section.description && !isCollapsed && (
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                {section.description}
              </Text>
            )}
          </View>
          {section.collapsible && (
            <Text style={[styles.collapseIcon, { color: colors.textSecondary }]}>
              {isCollapsed ? '▶' : '▼'}
            </Text>
          )}
        </TouchableOpacity>

        {!isCollapsed && (
          <View style={styles.fieldsContainer}>
            {sectionFields.map((field) => (
              <View key={field.id} style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldIcon}>{getFieldIcon(field)}</Text>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      {field.label}
                      {field.required && <Text style={styles.required}> *</Text>}
                    </Text>
                  </View>
                  {isFieldFilled(field, values[field.id]) && (
                    <Text style={styles.filledIndicator}>✓</Text>
                  )}
                </View>

                {field.helpText && (
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    {field.helpText}
                  </Text>
                )}

                {renderField(field)}

                {errors[field.id] && (
                  <Text style={styles.errorText}>{errors[field.id]}</Text>
                )}
              </View>
            ))}

            {isMini && section.fields.length > 3 && (
              <Text style={[styles.moreFieldsText, { color: colors.textSecondary }]}>
                +{section.fields.length - 3} more fields...
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height, width }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.description && !isMini && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {data.description}
            </Text>
          )}
        </View>
        {isMini && onExpandPress && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
            <Text style={styles.expandIcon}>⤢</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalFields}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fields</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.filledFields}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Filled</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: stats.completionRate >= 100 ? '#10B981' : '#F59E0B' }]}>
            {Math.round(stats.completionRate)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Complete</Text>
        </View>
        {!isMini && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.requiredFields}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Required</Text>
          </View>
        )}
      </View>

      {/* Form sections */}
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={true}
      >
        {data.sections.map((section) => renderSection(section))}
      </ScrollView>

      {/* Submit button (only in full mode) */}
      {!isMini && onSubmit && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              Object.keys(errors).length > 0 && styles.submitButtonDisabled,
            ]}
            onPress={() => {
              const validationErrors = onValidate?.(values) || {};
              if (Object.keys(validationErrors).length === 0) {
                onSubmit(values);
              } else if (!externalErrors) {
                setInternalErrors(validationErrors);
              }
            }}
            disabled={Object.keys(errors).length > 0}
          >
            <Text style={styles.submitButtonText}>Submit Form</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  collapseIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  fieldsContainer: {
    padding: 12,
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  filledIndicator: {
    fontSize: 16,
    color: '#10B981',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderContainer: {
    gap: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 12,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 28,
    color: '#F59E0B',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  unsupportedField: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  moreFieldsText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
