/**
 * Common Types
 * Shared type definitions used across interactive components
 */

export type ComponentMode = 'mini' | 'full' | 'preview';

export interface BaseComponentProps {
  mode?: ComponentMode;
  height?: number;
  width?: number;
  onExpandPress?: () => void;
}

export interface BaseDataProps {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface BaseDetailViewProps {
  visible: boolean;
  onClose: () => void;
}

export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
  icon?: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}
