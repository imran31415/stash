export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color?: string;
  metadata?: {
    percentage?: number;
    dropoff?: number;
    dropoffRate?: number;
    [key: string]: any;
  };
}

export interface FunnelChartData {
  id: string;
  title: string;
  description?: string;
  stages: FunnelStage[];
  metadata?: {
    totalEntries?: number;
    conversionRate?: number;
    averageValue?: number;
    [key: string]: any;
  };
}

export type FunnelChartMode = 'mini' | 'full';
export type FunnelOrientation = 'vertical' | 'horizontal';

export interface FunnelChartProps {
  data: FunnelChartData;
  mode?: FunnelChartMode;
  orientation?: FunnelOrientation;
  height?: number;
  width?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  showDropoff?: boolean;
  onStagePress?: (stage: FunnelStage, index: number) => void;
  onExpandPress?: () => void;
}

export interface FunnelChartDetailViewProps {
  data: FunnelChartData;
  visible: boolean;
  onClose: () => void;
  onStagePress?: (stage: FunnelStage, index: number) => void;
}

export interface FunnelChartStats {
  totalStages: number;
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  averageDropoffRate: number;
  biggestDropStage?: FunnelStage;
}
