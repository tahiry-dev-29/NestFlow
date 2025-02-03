import { Injectable, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { UserStore } from '../../users/store/users.store';
import { SubscriptionStore } from '../../subscription/store/store';
import { ChartDataSet, ChartDataConfig } from '../models/chart.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionChartService {
  private userStore = inject(UserStore);
  private subscriptionStore = inject(SubscriptionStore);

  /** Retourne les couleurs du thème (celles définies dans votre SCSS) */
  getChartColors() {
    return {
      primary: {
        base: '#0D6EFD',
        light: '#66B2FF',
        dark: '#0B5ED7',
        bg: 'rgba(13, 110, 253, 0.1)'
      },
      success: {
        base: '#198754',
        light: '#3DDC84',
        dark: '#157347',
        bg: 'rgba(25, 135, 84, 0.1)'
      },
      warning: {
        base: '#FFC107',
        light: '#FFCA2D',
        dark: '#D39E00',
        bg: 'rgba(255, 193, 7, 0.1)'
      },
      danger: {
        base: '#DC3545',
        light: '#FF6B6B',
        dark: '#BB2D3B',
        bg: 'rgba(220, 53, 69, 0.1)'
      }
    };
  }

  /** Liste des types de données disponibles */
  getDataTypes(): string[] {
    return [
      'User Data',
      'Business Unit',
      'Subscription Status',
      'User Status',
      'Subscription Revenue',
      'Subscription Duration',
      'Average risk over time',
      'Risk by business unit'
    ];
  }

  /**
   * Retourne les données en fonction du type demandé.
   * Pour 'Subscription Duration', on calcule la durée (en mois) entre subscriptionStartDate et subscriptionEndDate.
   * Pour les types composites ('Average risk over time' et 'Risk by business unit'), le traitement se fera directement dans le composant.
   */
  getChartData(dataType: string): ChartDataSet[] {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const users = this.userStore.users();

    if (!subscriptions.length || !users.length) {
      console.warn('Les données ne sont pas encore chargées');
      return [];
    }

    const stats = this.subscriptionStore.subscriptionStats();

    switch (dataType) {
      case 'User Data':
        return [
          { label: 'Active Users', value: users.filter(user => user.online).length },
          { label: 'Total Users', value: users.length }
        ];

      case 'Business Unit': {
        const totalRevenue = subscriptions.reduce((total, sub) => total + (sub.details.price || 0), 0);
        return [
          { label: 'Active Subscriptions', value: stats.active },
          { label: 'Total Revenue', value: totalRevenue }
        ];
      }

      case 'Subscription Status':
        return [
          { label: 'Active', value: stats.active },
          { label: 'Expired', value: stats.expired }
        ];

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

      case 'Subscription Duration': {
        const differenceInMonths = (start: Date, end: Date): number => {
          return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        };

        const durationsByMonth: { [month: string]: { totalDuration: number; count: number } } = {};
        subscriptions.forEach(sub => {
          const start = new Date(sub.details.subscriptionStartDate ?? new Date());
          const end = new Date(sub.details.subscriptionEndDate ?? new Date());
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const monthsDiff = differenceInMonths(start, end);
            const monthKey = `${start.getFullYear()}-${('0' + (start.getMonth() + 1)).slice(-2)}`;
            if (!durationsByMonth[monthKey]) {
              durationsByMonth[monthKey] = { totalDuration: 0, count: 0 };
            }
            durationsByMonth[monthKey].totalDuration += monthsDiff;
            durationsByMonth[monthKey].count += 1;
          }
        });
        const sortedMonths = Object.keys(durationsByMonth).sort();
        return sortedMonths.map(month => {
          const { totalDuration, count } = durationsByMonth[month];
          const averageDuration = count > 0 ? totalDuration / count : 0;
          return { label: month, value: Number(averageDuration.toFixed(1)) };
        });
      }

      default:
        return [];
    }
  }

  /**
   * Formate la configuration du graphique pour Chart.js en fonction du type de données et du type de chart.
   * Pour les types composites, le traitement se fait directement dans le composant.
   */
  formatChartData(dataType: string, chartType: string): ChartDataConfig {
    const data = this.getChartData(dataType);
    const colors = this.getChartColors();

    const colorMapping: Record<string, { backgroundColor: string | string[]; borderColor: string | string[] }> = {
      'User Data': {
        backgroundColor: [colors.primary.bg, colors.success.bg],
        borderColor: [colors.primary.base, colors.success.base]
      },
      'Business Unit': {
        backgroundColor: [colors.success.bg, colors.warning.bg],
        borderColor: [colors.success.base, colors.warning.base]
      },
      'Subscription Status': {
        backgroundColor: [colors.success.bg, colors.danger.bg],
        borderColor: [colors.success.base, colors.danger.base]
      },
      'User Status': {
        backgroundColor: [colors.primary.bg, colors.warning.bg],
        borderColor: [colors.primary.base, colors.warning.base]
      },
      'Subscription Revenue': {
        backgroundColor: [colors.success.bg, colors.primary.bg],
        borderColor: [colors.success.base, colors.primary.base]
      },
      'Subscription Duration': {
        backgroundColor: [colors.warning.bg, colors.danger.bg],
        borderColor: [colors.warning.base, colors.danger.base]
      }
    };

    const { backgroundColor, borderColor } = colorMapping[dataType] || { 
      backgroundColor: colors.primary.bg, 
      borderColor: colors.primary.base 
    };

    const chartConfig: ChartDataConfig = {
      labels: data.map(item => item.label),
      datasets: [{
        label: dataType,
        data: data.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: (chartType === 'pie' || chartType === 'doughnut') ? 1 : 2,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined
      }]
    };

    return chartConfig;
  }

  /** Options générales pour Chart.js */
  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { 
            color: '#ffffff',
            font: { family: 'shantellasans' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'shantellasans' },
          bodyFont: { family: 'shantellasans' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff', font: { family: 'shantellasans' } }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff', font: { family: 'shantellasans' } }
        }
      }
    };
  }

  /** Options spécifiques pour les mini charts */
  getMiniChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { family: 'shantellasans' },
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'shantellasans' },
          bodyFont: { family: 'shantellasans' },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              switch (context.dataIndex) {
                case 0:
                  return `Revenue: ${value.toLocaleString()} €`;
                case 1:
                  return `Abonnements: ${value}`;
                default:
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
