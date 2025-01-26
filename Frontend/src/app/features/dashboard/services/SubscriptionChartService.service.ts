// subscription-chart.service.ts
import { Injectable, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { UserStore } from '../../users/store/users.store';
import { SubscriptionStore } from '../../subscription/store/store';

export interface ChartDataSet {
  label: string;
  value: number;
}

export interface ChartDataConfig {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionChartService {
  private userStore = inject(UserStore);
  private subscriptionStore = inject(SubscriptionStore);

  getDataTypes(): string[] {
    return [
      'User Data',
      'Business Unit',
      'Subscription Status',
      'User Status',
      'Subscription Revenue'
    ];
  }

  getChartData(dataType: string): ChartDataSet[] {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const users = this.userStore.users();
    
    if (!subscriptions.length || !users.length) {
      console.warn('Data not yet loaded');
      return [];
    }

    const stats = this.subscriptionStore.subscriptionStats();

    switch(dataType) {
      case 'User Data': {
        return [
          { label: 'Active Users', value: users.filter(user => user.online).length },
          { label: 'Total Users', value: users.length }
        ];
      }

      case 'Business Unit': {
        const totalRevenue = subscriptions.reduce((total, sub) => total + (sub.details.price || 0), 0);
        return [
          { label: 'Active Subscriptions', value: stats.active },
          { label: 'Total Revenue', value: totalRevenue }
        ];
      }

      case 'Subscription Status': {
        return [
          { label: 'Active', value: stats.active },
          { label: 'Expired', value: stats.expired }
        ];
      }

      case 'User Status': {
        const activeUsers = users.filter(user => user.online === true).length;
        const inactiveUsers = users.filter(user => user.online === false).length;
        return [
          { label: 'Active Users', value: activeUsers },
          { label: 'Inactive Users', value: inactiveUsers }
        ];
      }

      case 'Subscription Revenue': {
        const totalRevenue = subscriptions.reduce((total, sub) => total + (sub.details.price || 0), 0);
        const averageRevenue = totalRevenue / (subscriptions.length || 1);
        return [
          { label: 'Total Revenue', value: totalRevenue },
          { label: 'Average Revenue', value: Math.round(averageRevenue) }
        ];
      }

      default:
        return [];
    }
  }

  getChartColors() {
    return {
      primary: {
        base: 'rgba(13, 110, 253, 0.8)',
        light: 'rgba(102, 178, 255, 0.8)',
        bg: 'rgba(13, 110, 253, 0.1)'
      },
      success: {
        base: 'rgba(25, 135, 84, 0.8)',
        light: 'rgba(61, 220, 132, 0.8)',
        bg: 'rgba(25, 135, 84, 0.1)'
      },
      warning: {
        base: 'rgba(255, 193, 7, 0.8)',
        light: 'rgba(255, 202, 45, 0.8)',
        bg: 'rgba(255, 193, 7, 0.1)'
      },
      danger: {
        base: 'rgba(220, 53, 69, 0.8)',
        light: 'rgba(255, 107, 107, 0.8)',
        bg: 'rgba(220, 53, 69, 0.1)'
      }
    };
  }

  formatChartData(dataType: string, chartType: string): ChartDataConfig {
    const data = this.getChartData(dataType);
    const colors = this.getChartColors();
    
    let backgroundColor: string | string[], borderColor: string | string[];
    switch(dataType) {
      case 'User Data':
        backgroundColor = [colors.primary.bg, colors.success.bg];
        borderColor = [colors.primary.base, colors.success.base];
        break;
      case 'Business Unit':
        backgroundColor = [colors.success.bg, colors.warning.bg];
        borderColor = [colors.success.base, colors.warning.base];
        break;
      case 'Subscription Status':
        backgroundColor = [colors.success.bg, colors.danger.bg];
        borderColor = [colors.success.base, colors.danger.base];
        break;
      case 'User Status':
        backgroundColor = [colors.primary.bg, colors.warning.bg];
        borderColor = [colors.primary.base, colors.warning.base];
        break;
      case 'Subscription Revenue':
        backgroundColor = [colors.success.bg, colors.primary.bg];
        borderColor = [colors.success.base, colors.primary.base];
        break;
      default:
        backgroundColor = colors.primary.bg;
        borderColor = colors.primary.base;
    }

    const chartConfig: ChartDataConfig = {
      labels: data.map(item => item.label),
      datasets: [{
        label: dataType,
        data: data.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: 2,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined
      }]
    };

    if (chartType === 'pie' || chartType === 'doughnut') {
      chartConfig.datasets[0].borderWidth = 1;
      chartConfig.datasets[0].fill = true;
    }

    return chartConfig;
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { 
            color: 'white',
            font: {
              family: 'shantellasans'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: {
            family: 'shantellasans'
          },
          bodyFont: {
            family: 'shantellasans'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { 
            color: 'white',
            font: {
              family: 'shantellasans'
            }
          }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { 
            color: 'white',
            font: {
              family: 'shantellasans'
            }
          }
        }
      }
    };
  }

  getMiniChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'bottom',
          labels: {
            color: 'white',
            font: {
              family: 'shantellasans'
            },
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: {
            family: 'shantellasans'
          },
          bodyFont: {
            family: 'shantellasans'
          },
          callbacks: {
            label: function(context) {
              const value = context.raw as number;
              if (context.dataIndex === 0) {
                return `Revenue: ${value.toLocaleString()} €`;
              } else if (context.dataIndex === 1) {
                return `Abonnements: ${value}`;
              } else {
                return `Utilisateurs: ${value}`;
              }
            }
          }
        }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    };
  }
}