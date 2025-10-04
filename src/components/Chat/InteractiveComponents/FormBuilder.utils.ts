import type { FormBuilderData, FormBuilderStats, FormField, ValidationRule } from './FormBuilder.types';

/**
 * Calculate form statistics
 */
export function calculateFormStats(data: FormBuilderData, values: Record<string, any>): FormBuilderStats {
  let totalFields = 0;
  let requiredFields = 0;
  let filledFields = 0;

  data.sections.forEach((section) => {
    section.fields.forEach((field) => {
      totalFields++;
      if (field.required) requiredFields++;
      if (values[field.id] !== undefined && values[field.id] !== '' && values[field.id] !== null) {
        filledFields++;
      }
    });
  });

  const optionalFields = totalFields - requiredFields;
  const completionRate = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  return {
    totalFields,
    requiredFields,
    optionalFields,
    filledFields,
    completionRate,
  };
}

/**
 * Validate a single field
 */
export function validateField(field: FormField, value: any): string | null {
  if (!field.validation) return null;

  for (const rule of field.validation) {
    const error = validateRule(rule, value, field);
    if (error) return error;
  }

  return null;
}

/**
 * Validate a single rule
 */
function validateRule(rule: ValidationRule, value: any, field: FormField): string | null {
  const defaultMessage = rule.message || `Validation failed for ${field.label}`;

  switch (rule.type) {
    case 'required':
      if (value === undefined || value === null || value === '') {
        return rule.message || `${field.label} is required`;
      }
      break;

    case 'minLength':
      if (typeof value === 'string' && value.length < (rule.value || 0)) {
        return rule.message || `${field.label} must be at least ${rule.value} characters`;
      }
      break;

    case 'maxLength':
      if (typeof value === 'string' && value.length > (rule.value || 0)) {
        return rule.message || `${field.label} must be no more than ${rule.value} characters`;
      }
      break;

    case 'min':
      if (typeof value === 'number' && value < (rule.value || 0)) {
        return rule.message || `${field.label} must be at least ${rule.value}`;
      }
      break;

    case 'max':
      if (typeof value === 'number' && value > (rule.value || 0)) {
        return rule.message || `${field.label} must be no more than ${rule.value}`;
      }
      break;

    case 'pattern':
      if (typeof value === 'string' && rule.value && !new RegExp(rule.value).test(value)) {
        return rule.message || `${field.label} format is invalid`;
      }
      break;

    case 'email':
      if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message || `${field.label} must be a valid email`;
      }
      break;

    case 'url':
      if (typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          return rule.message || `${field.label} must be a valid URL`;
        }
      }
      break;

    case 'custom':
      if (rule.validator && !rule.validator(value)) {
        return defaultMessage;
      }
      break;
  }

  return null;
}

/**
 * Validate all fields in a form
 */
export function validateForm(data: FormBuilderData, values: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};

  data.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const value = values[field.id];
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
      }
    });
  });

  return errors;
}

/**
 * Get initial form values
 */
export function getInitialValues(data: FormBuilderData): Record<string, any> {
  const values: Record<string, any> = {};

  data.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.id] = field.defaultValue;
      } else if (field.value !== undefined) {
        values[field.id] = field.value;
      } else {
        // Set default values based on field type
        switch (field.type) {
          case 'checkbox':
          case 'toggle':
            values[field.id] = false;
            break;
          case 'multiselect':
            values[field.id] = [];
            break;
          case 'number':
          case 'slider':
          case 'rating':
            values[field.id] = field.metadata?.min || 0;
            break;
          default:
            values[field.id] = '';
        }
      }
    });
  });

  return values;
}

/**
 * Get field icon
 */
export function getFieldIcon(field: FormField): string {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'url':
      return '✏️';
    case 'number':
    case 'tel':
      return '🔢';
    case 'textarea':
      return '📝';
    case 'select':
    case 'multiselect':
      return '📋';
    case 'checkbox':
      return '☑️';
    case 'radio':
      return '🔘';
    case 'date':
    case 'datetime':
      return '📅';
    case 'time':
      return '⏰';
    case 'file':
      return '📎';
    case 'toggle':
      return '🔄';
    case 'slider':
      return '🎚️';
    case 'rating':
      return '⭐';
    default:
      return '📄';
  }
}

/**
 * Check if field is filled
 */
export function isFieldFilled(field: FormField, value: any): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}
