import type { FunnelChartData, FunnelChartStats, FunnelStage } from './FunnelChart.types';

/**
 * Calculate funnel statistics
 */
export function calculateFunnelStats(data: FunnelChartData): FunnelChartStats {
  if (data.stages.length === 0) {
    return {
      totalStages: 0,
      totalEntries: 0,
      totalConversions: 0,
      overallConversionRate: 0,
      averageDropoffRate: 0,
    };
  }

  const totalStages = data.stages.length;
  const totalEntries = data.stages[0]?.value || 0;
  const totalConversions = data.stages[data.stages.length - 1]?.value || 0;
  const overallConversionRate = totalEntries > 0 ? (totalConversions / totalEntries) * 100 : 0;

  let totalDropoff = 0;
  let biggestDropStage: FunnelStage | undefined;
  let biggestDrop = 0;

  for (let i = 1; i < data.stages.length; i++) {
    const prevValue = data.stages[i - 1].value;
    const currValue = data.stages[i].value;
    const dropoff = prevValue - currValue;
    const dropoffRate = prevValue > 0 ? (dropoff / prevValue) * 100 : 0;

    totalDropoff += dropoffRate;

    if (dropoff > biggestDrop) {
      biggestDrop = dropoff;
      biggestDropStage = data.stages[i];
    }
  }

  const averageDropoffRate = data.stages.length > 1 ? totalDropoff / (data.stages.length - 1) : 0;

  return {
    totalStages,
    totalEntries,
    totalConversions,
    overallConversionRate,
    averageDropoffRate,
    biggestDropStage,
  };
}

/**
 * Calculate stage percentages and dropoff rates
 */
export function calculateStageMetrics(stages: FunnelStage[]): FunnelStage[] {
  if (stages.length === 0) return [];

  const firstStageValue = stages[0].value;

  return stages.map((stage, index) => {
    const percentage = firstStageValue > 0 ? (stage.value / firstStageValue) * 100 : 0;
    let dropoff = 0;
    let dropoffRate = 0;

    if (index > 0) {
      const prevValue = stages[index - 1].value;
      dropoff = prevValue - stage.value;
      dropoffRate = prevValue > 0 ? (dropoff / prevValue) * 100 : 0;
    }

    return {
      ...stage,
      metadata: {
        ...stage.metadata,
        percentage,
        dropoff,
        dropoffRate,
      },
    };
  });
}

/**
 * Get default color for stage
 */
export function getStageColor(stage: FunnelStage, index: number, total: number): string {
  if (stage.color) return stage.color;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  return colors[index % colors.length];
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}
