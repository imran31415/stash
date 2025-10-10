export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'toggle'
  | 'slider'
  | 'rating'
  | 'custom';

export interface FieldOption {
  id: string;
  label: string;
  value: any;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  value?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  description?: string;
  metadata?: {
    min?: number;
    max?: number;
    step?: number;
    rows?: number;
    accept?: string;
    multiple?: boolean;
    [key: string]: any;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FormBuilderData {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  metadata?: {
    totalFields?: number;
    requiredFields?: number;
    [key: string]: any;
  };
}

export type FormBuilderMode = 'mini' | 'full';

export interface FormBuilderProps {
  data: FormBuilderData;
  mode?: FormBuilderMode;
  height?: number;
  width?: number;
  values?: Record<string, any>;
  errors?: Record<string, string>;
  onChange?: (fieldId: string, value: any) => void;
  onSubmit?: (values: Record<string, any>) => void;
  onValidate?: (values: Record<string, any>) => Record<string, string>;
  onExpandPress?: () => void;
}

export interface FormBuilderDetailViewProps {
  data: FormBuilderData;
  visible: boolean;
  onClose: () => void;
  values?: Record<string, any>;
  errors?: Record<string, string>;
  onChange?: (fieldId: string, value: any) => void;
  onSubmit?: (values: Record<string, any>) => void;
  onValidate?: (values: Record<string, any>) => Record<string, string>;
}

export interface FormBuilderStats {
  totalFields: number;
  requiredFields: number;
  optionalFields: number;
  filledFields: number;
  completionRate: number;
}
