// src/app/subscription/services/subscription-chart.service.ts

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

  /** Liste des types de données pour les charts */
  getDataTypes(): string[] {
    return [
      'User Data',
      'Business Unit',
      'Subscription Status',
      'User Status',
      'Subscription Revenue'
    ];
  }

  /** Retourne un tableau de statistiques en fonction du dataType */
  getChartData(dataType: string): ChartDataSet[] {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const users = this.userStore.users();
    
    if (!subscriptions.length || !users.length) {
      console.warn('Data not yet loaded');
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

      default:
        return [];
    }
  }

  /** Définit les couleurs globales */
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

  /**
   * Retourne une configuration de chart formatée en fonction du type de données et du type de chart.
   */
  formatChartData(dataType: string, chartType: string): ChartDataConfig {
    const data = this.getChartData(dataType);
    const colors = this.getChartColors();

    // Dictionnaire pour associer chaque dataType aux couleurs souhaitées
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
      }
    };

    // Valeurs par défaut si le dataType n'est pas défini dans le mapping
    const { backgroundColor, borderColor } = colorMapping[dataType] || { backgroundColor: colors.primary.bg, borderColor: colors.primary.base };

    const chartConfig: ChartDataConfig = {
      labels: data.map(item => item.label),
      datasets: [{
        label: dataType,
        data: data.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: chartType === 'pie' || chartType === 'doughnut' ? 1 : 2,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined
      }]
    };

    return chartConfig;
  }

  /** Options générales pour les charts */
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
          titleFont: { family: 'shantellasans' },
          bodyFont: { family: 'shantellasans' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { 
            color: 'white',
            font: { family: 'shantellasans' }
          }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { 
            color: 'white',
            font: { family: 'shantellasans' }
          }
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
            color: 'white',
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
              // Personnalisation en fonction de l'indice de donnée
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
