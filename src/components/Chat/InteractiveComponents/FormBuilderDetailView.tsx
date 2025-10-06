import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { FormBuilderDetailViewProps, FormField } from './FormBuilder.types';
import { FormBuilder } from './FormBuilder';
import { calculateFormStats, validateForm, getInitialValues, getFieldIcon, isFieldFilled } from './FormBuilder.utils';

export const FormBuilderDetailView: React.FC<FormBuilderDetailViewProps> = ({
  data,
  visible,
  onClose,
  values: externalValues,
  errors: externalErrors,
  onChange,
  onSubmit,
  onValidate,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'form' | 'fields' | 'stats'>('form');
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const [internalValues, setInternalValues] = useState<Record<string, any>>(() =>
    getInitialValues(data)
  );

  const values = externalValues || internalValues;

  const stats = useMemo(() => calculateFormStats(data, values), [data, values]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      if (onChange) {
        onChange(fieldId, value);
      } else {
        setInternalValues((prev) => ({ ...prev, [fieldId]: value }));
      }
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (formValues: Record<string, any>) => {
      if (onSubmit) {
        onSubmit(formValues);
        onClose();
      }
    },
    [onSubmit, onClose]
  );

  const renderFieldsList = () => {
    const allFields: Array<{ section: string; field: FormField }> = [];
    data.sections.forEach((section) => {
      section.fields.forEach((field) => {
        allFields.push({ section: section.title, field });
      });
    });

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.fieldsListContent}>
        {allFields.map(({ section, field }) => {
          const value = values[field.id];
          const isFilled = isFieldFilled(field, value);

          return (
            <TouchableOpacity
              key={field.id}
              style={[
                styles.fieldListItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setSelectedField(field)}
            >
              <View style={styles.fieldListHeader}>
                <Text style={styles.fieldListIcon}>{getFieldIcon(field)}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.fieldListTitleRow}>
                    <Text style={[styles.fieldListTitle, { color: colors.text }]}>
                      {field.label}
                      {field.required && <Text style={styles.required}> *</Text>}
                    </Text>
                    {isFilled && <Text style={styles.filledIndicator}>✓</Text>}
                  </View>
                  <Text style={[styles.fieldListSection, { color: colors.textSecondary }]}>
                    {section} • {field.type}
                  </Text>
                </View>
              </View>
              {field.description && (
                <Text style={[styles.fieldListDescription, { color: colors.textSecondary }]}>
                  {field.description}
                </Text>
              )}
              {isFilled && (
                <View style={[styles.valuePreview, { backgroundColor: colors.background }]}>
                  <Text style={[styles.valuePreviewText, { color: colors.text }]} numberOfLines={1}>
                    {typeof value === 'boolean'
                      ? value
                        ? 'Yes'
                        : 'No'
                      : Array.isArray(value)
                      ? value.join(', ')
                      : value?.toString() || ''}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderStatsTab = () => {
    const requiredFields: FormField[] = [];
    const optionalFields: FormField[] = [];
    const filledFieldsList: FormField[] = [];
    const unfilledFieldsList: FormField[] = [];

    data.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) requiredFields.push(field);
        else optionalFields.push(field);

        if (isFieldFilled(field, values[field.id])) {
          filledFieldsList.push(field);
        } else {
          unfilledFieldsList.push(field);
        }
      });
    });

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
        {/* Overview */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>Form Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsGridItem}>
              <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.totalFields}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Total Fields</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={[styles.statsGridValue, { color: colors.primary }]}>{stats.filledFields}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Filled</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={[styles.statsGridValue, { color: '#EF4444' }]}>{stats.requiredFields}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Required</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={[styles.statsGridValue, { color: '#6B7280' }]}>{stats.optionalFields}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Optional</Text>
            </View>
          </View>
        </View>

        {/* Completion */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>Completion</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${stats.completionRate}%`,
                    backgroundColor: stats.completionRate >= 100 ? '#10B981' : colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(stats.completionRate)}%
            </Text>
          </View>
          <Text style={[styles.statsCardDescription, { color: colors.textSecondary }]}>
            {stats.filledFields} of {stats.totalFields} fields completed
          </Text>
        </View>

        {/* Unfilled Fields */}
        {unfilledFieldsList.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statsCardTitle, { color: colors.text }]}>
              Unfilled Fields ({unfilledFieldsList.length})
            </Text>
            <View style={styles.fieldsList}>
              {unfilledFieldsList.map((field) => (
                <View key={field.id} style={styles.fieldItem}>
                  <Text style={styles.fieldItemIcon}>{getFieldIcon(field)}</Text>
                  <Text style={[styles.fieldItemText, { color: colors.text }]}>
                    {field.label}
                    {field.required && <Text style={styles.required}> *</Text>}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sections */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>Sections</Text>
          {data.sections.map((section) => {
            const sectionFilledCount = section.fields.filter((f) =>
              isFieldFilled(f, values[f.id])
            ).length;
            const sectionProgress = (sectionFilledCount / section.fields.length) * 100;

            return (
              <View key={section.id} style={styles.sectionStat}>
                <View style={styles.sectionStatHeader}>
                  <Text style={[styles.sectionStatTitle, { color: colors.text }]}>{section.title}</Text>
                  <Text style={[styles.sectionStatValue, { color: colors.textSecondary }]}>
                    {sectionFilledCount}/{section.fields.length}
                  </Text>
                </View>
                <View style={[styles.sectionProgressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.sectionProgressFill,
                      {
                        width: `${sectionProgress}%`,
                        backgroundColor: sectionProgress >= 100 ? '#10B981' : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderFieldDetails = () => {
    if (!selectedField) return null;

    return (
      <View
        style={[styles.fieldDetailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <View style={styles.fieldDetailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldDetailsTitle, { color: colors.text }]}>{selectedField.label}</Text>
            <Text style={[styles.fieldDetailsType, { color: colors.textSecondary }]}>
              {selectedField.type}
              {selectedField.required && ' • Required'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedField(null)} style={styles.closeDetailsButton}>
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.fieldDetailsContent} showsVerticalScrollIndicator={false}>
          {selectedField.description && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {selectedField.description}
              </Text>
            </View>
          )}

          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Field ID</Text>
            <Text style={[styles.detailsSectionText, { color: colors.text, fontFamily: 'monospace' }]}>
              {selectedField.id}
            </Text>
          </View>

          {selectedField.validation && selectedField.validation.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Validation Rules</Text>
              {selectedField.validation.map((rule, index) => (
                <View key={index} style={styles.validationRule}>
                  <Text style={[styles.validationRuleType, { color: colors.primary }]}>• {rule.type}</Text>
                  {rule.message && (
                    <Text style={[styles.validationRuleMessage, { color: colors.textSecondary }]}>
                      {rule.message}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {selectedField.options && selectedField.options.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Options</Text>
              {selectedField.options.map((option) => (
                <Text key={option.id} style={[styles.optionItem, { color: colors.text }]}>
                  • {option.label}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'form' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('form')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'form' ? colors.primary : colors.textSecondary },
              ]}
            >
              Form
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fields' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('fields')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'fields' ? colors.primary : colors.textSecondary },
              ]}
            >
              Fields
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'stats' ? colors.primary : colors.textSecondary },
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'form' && (
            <FormBuilder
              data={data}
              mode="full"
              values={values}
              errors={externalErrors}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              onValidate={onValidate}
            />
          )}
          {activeTab === 'fields' && renderFieldsList()}
          {activeTab === 'stats' && renderStatsTab()}
        </View>

        {/* Field details panel */}
        {activeTab === 'fields' && selectedField && renderFieldDetails()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  fieldsListContent: {
    padding: 16,
    gap: 12,
  },
  fieldListItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldListHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  fieldListIcon: {
    fontSize: 20,
  },
  fieldListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldListTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  filledIndicator: {
    fontSize: 16,
    color: '#10B981',
  },
  fieldListSection: {
    fontSize: 12,
    marginTop: 2,
  },
  fieldListDescription: {
    fontSize: 13,
  },
  valuePreview: {
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  valuePreviewText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsCardDescription: {
    fontSize: 13,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statsGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsGridValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsGridLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  fieldsList: {
    gap: 8,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldItemIcon: {
    fontSize: 16,
  },
  fieldItemText: {
    fontSize: 14,
  },
  sectionStat: {
    marginBottom: 12,
  },
  sectionStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionStatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionStatValue: {
    fontSize: 13,
  },
  sectionProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionProgressFill: {
    height: '100%',
  },
  fieldDetailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fieldDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  fieldDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldDetailsType: {
    fontSize: 13,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  fieldDetailsContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailsSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  validationRule: {
    marginBottom: 8,
  },
  validationRuleType: {
    fontSize: 14,
    fontWeight: '600',
  },
  validationRuleMessage: {
    fontSize: 13,
    marginLeft: 12,
  },
  optionItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});
