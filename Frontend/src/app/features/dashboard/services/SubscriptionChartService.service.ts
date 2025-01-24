// subscription-chart.service.ts
import { Injectable } from '@angular/core';
import { ChartOptions } from 'chart.js';

export interface ChartDataSet {
  month: string;
  value: number;
}

export interface ChartDataConfig {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionChartService {
  private userData: ChartDataSet[] = [
    { month: 'Janvier', value: 1000 },
    { month: 'Février', value: 1200 },
    { month: 'Mars', value: 1350 },
    { month: 'Avril', value: 1500 },
  ];

  private subscriptionData: ChartDataSet[] = [
    { month: 'Janvier', value: 800 },
    { month: 'Février', value: 950 },
    { month: 'Mars', value: 1100 },
    { month: 'Avril', value: 1250 },
  ];

  private renewSubscriptionData: ChartDataSet[] = [
    { month: 'Janvier', value: 600 },
    { month: 'Février', value: 700 },
    { month: 'Mars', value: 800 },
    { month: 'Avril', value: 900 },
  ];

  private expiredData: ChartDataSet[] = [
    { month: 'Janvier', value: 200 },
    { month: 'Février', value: 150 },
    { month: 'Mars', value: 180 },
    { month: 'Avril', value: 160 },
  ];

  getDataTypes(): string[] {
    return ['User Data', 'Subscription Data', 'Renew Subscription Data', 'Expired Data'];
  }

  getChartTypes(): string[] {
    return [
      'line',
      'bar',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'bubble',
      'scatter'
    ];
  }

  getChartData(dataType: string): ChartDataSet[] {
    switch(dataType) {
      case 'User Data':
        return this.userData;
      case 'Subscription Data':
        return this.subscriptionData;
      case 'Renew Subscription Data':
        return this.renewSubscriptionData;
      case 'Expired Data':
        return this.expiredData;
      default:
        return this.userData;
    }
  }

  getChartColors() {
    return {
      primary: ['#0D6EFD', '#66B2FF', '#99C2FF', '#B3D7FF'], // Updated to use Coulor UI colors
      success: ['#198754', '#3DDC84', '#6EE7B7', '#A7F3D0'], // Updated to use Coulor UI colors
      warning: ['#FFC107', '#FFCA2D', '#FFD54F', '#FFE57F'], // Updated to use Coulor UI colors
      danger: ['#DC3545', '#FF6B6B', '#FF9B9B', '#FFB3B3'], // Updated to use Coulor UI colors
    };
  }

  formatChartData(dataType: string, chartType: string) {
    const selectedData = this.getChartData(dataType);
    const colors = this.getChartColors();
    
    const datasets = [{
      label: dataType,
      data: selectedData.map(data => data.value),
      backgroundColor: chartType === 'line' ? 
        colors.primary[0] : 
        [colors.primary[0], colors.success[0], colors.warning[0], colors.danger[0]],
      borderColor: chartType === 'line' ? 
        colors.primary[0] : 
        [colors.primary[0], colors.success[0], colors.warning[0], colors.danger[0]],
      borderWidth: 2,
      fill: chartType === 'line' ? false : true,
      tension: 0.4
    }];

    return {
      labels: selectedData.map(data => data.month),
      datasets
    };
  }

  getMiniChartData(): ChartDataConfig {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [65, 59, 80, 81, 56, 55],
        fill: true,
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }

  getRiskChartData(): ChartDataConfig {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [40, 45, 42, 41, 44, 42],
        fill: true,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4
      }]
    };
  }

  getCoverageChartData(): ChartDataConfig {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [90, 91, 93, 92, 94, 94],
        fill: true,
        borderColor: 'rgba(25, 135, 84, 1)',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        tension: 0.4
      }]
    };
  }

  getPerformanceChartData(): ChartDataConfig {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [70, 75, 72, 76, 71, 76],
        fill: true,
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.4
      }]
    };
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: 'white' }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: 'white' }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: 'white' }
        }
      }
    };
  }

  getMiniChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { 
          enabled: true,
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          padding: 10,
          cornerRadius: 4
        }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
        },
        point: {
          radius: 0,
          hitRadius: 8,
          hoverRadius: 4
        }
      }
    };
  }
}