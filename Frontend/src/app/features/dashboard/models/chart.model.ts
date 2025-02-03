// chart.model.ts
export interface ChartDataSet {
  label: string;
  value: number;
}

export interface ChartDataConfig {
  labels: string[];
  datasets: {
    label?: string;
    data: number[] | { x: string; y: number }[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}
