import { Injectable, inject } from '@angular/core';
import { ChartDataConfig, ChartDataSet } from '../models/chart.model';
import { SubscriptionStore } from '../../subscription/store/store';
import { UserStore } from '../../users/store/users.store';
import {
  ChartColors,
  ChartOptions,
  MiniChartOptions,
} from '../configs/chart-config';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionChartService {
  private userStore = inject(UserStore);
  private subscriptionStore = inject(SubscriptionStore);

  getChartColors() {
    return ChartColors;
  }

  getChartOptions(): any {
    return ChartOptions;
  }
  getMiniChartOptions(): any {
    return MiniChartOptions;
  }
  getDataTypes(): string[] {
    return [
      'User Data',
      'Business Unit',
      'Subscription Status',
      'User Status',
      'Subscription Revenue',
      'Subscription Duration',
      'Average risk over time',
      'Risk by business unit',
    ];
  }
  getChartData(dataType: string): ChartDataSet[] {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const users = this.userStore.users();

    if (!subscriptions.length || !users.length) {
      return [];
    }

    const stats = this.subscriptionStore.subscriptionStats();

    switch (dataType) {
      case 'User Data':
        return [
          {
            label: 'Active Users',
            value: users.filter((user) => user.online).length,
          },
          { label: 'Total Users', value: users.length },
        ];

      case 'Business Unit': {
        const totalRevenue = subscriptions.reduce(
          (total, sub) => total + (sub.details.price || 0),
          0
        );
        return [
          { label: 'Active Subscriptions', value: stats.active },
          { label: 'Total Revenue', value: totalRevenue },
        ];
      }

      case 'Subscription Status':
        return [
          { label: 'Active', value: stats.active },
          { label: 'Expired', value: stats.expired },
        ];

      case 'User Status': {
        const activeUsers = users.filter((user) => user.online === true).length;
        const inactiveUsers = users.filter(
          (user) => user.online === false
        ).length;
        return [
          { label: 'Active Users', value: activeUsers },
          { label: 'Inactive Users', value: inactiveUsers },
        ];
      }

      case 'Subscription Revenue': {
        const totalRevenue = subscriptions.reduce(
          (total, sub) => total + (sub.details.price || 0),
          0
        );
        const averageRevenue = totalRevenue / (subscriptions.length || 1);
        return [
          { label: 'Total Revenue', value: totalRevenue },
          { label: 'Average Revenue', value: Math.round(averageRevenue) },
        ];
      }

      case 'Subscription Duration': {
        const differenceInMonths = (start: Date, end: Date): number => {
          return (
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth())
          );
        };

        const durationsByMonth: {
          [month: string]: { totalDuration: number; count: number };
        } = {};
        subscriptions.forEach((sub) => {
          const start = new Date(
            sub.details.subscriptionStartDate ?? new Date()
          );
          const end = new Date(sub.details.subscriptionEndDate ?? new Date());
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const monthsDiff = differenceInMonths(start, end);
            const monthKey = `${start.getFullYear()}-${(
              '0' +
              (start.getMonth() + 1)
            ).slice(-2)}`;
            if (!durationsByMonth[monthKey]) {
              durationsByMonth[monthKey] = { totalDuration: 0, count: 0 };
            }
            durationsByMonth[monthKey].totalDuration += monthsDiff;
            durationsByMonth[monthKey].count += 1;
          }
        });
        const sortedMonths = Object.keys(durationsByMonth).sort();
        return sortedMonths.map((month) => {
          const { totalDuration, count } = durationsByMonth[month];
          const averageDuration = count > 0 ? totalDuration / count : 0;
          return { label: month, value: Number(averageDuration.toFixed(1)) };
        });
      }

      default:
        return [];
    }
  }

  formatChartData(dataType: string, chartType: string): ChartDataConfig {
    const data = this.getChartData(dataType);
    const colors = this.getChartColors();

    const colorMapping: Record<
      string,
      { backgroundColor: string | string[]; borderColor: string | string[] }
    > = {
      'User Data': {
        backgroundColor: [colors.primary.bg, colors.success.bg],
        borderColor: [colors.primary.base, colors.success.base],
      },
      'Business Unit': {
        backgroundColor: [colors.success.bg, colors.warning.bg],
        borderColor: [colors.success.base, colors.warning.base],
      },
      'Subscription Status': {
        backgroundColor: [colors.success.bg, colors.danger.bg],
        borderColor: [colors.success.base, colors.danger.base],
      },
      'User Status': {
        backgroundColor: [colors.primary.bg, colors.warning.bg],
        borderColor: [colors.primary.base, colors.warning.base],
      },
      'Subscription Revenue': {
        backgroundColor: [colors.success.bg, colors.primary.bg],
        borderColor: [colors.success.base, colors.primary.base],
      },
      'Subscription Duration': {
        backgroundColor: [colors.warning.bg, colors.danger.bg],
        borderColor: [colors.warning.base, colors.danger.base],
      },
    };

    const { backgroundColor, borderColor } = colorMapping[dataType] || {
      backgroundColor: colors.primary.bg,
      borderColor: colors.primary.base,
    };

    const chartConfig: ChartDataConfig = {
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: dataType,
          data: data.map((item) => item.value),
          backgroundColor,
          borderColor,
          borderWidth: chartType === 'pie' || chartType === 'doughnut' ? 1 : 2,
          fill: chartType === 'line',
          tension: chartType === 'line' ? 0.4 : undefined,
        },
      ],
    };

    return chartConfig;
  }
}
