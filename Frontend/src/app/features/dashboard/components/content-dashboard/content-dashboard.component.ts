import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  ChartOptions,
  ChartTypeRegistry,
  registerables,
} from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { MainChartComponent } from '../ChartsComponents/MainChartComponent.component';
import { MiniChartComponentComponent } from '../ChartsComponents/MiniChartComponent.component';
import { RightChartComponent } from '../ChartsComponents/RightChartComponent.component';
import { ChartDataConfig } from '../../models/chart.model';
import { SubscriptionStore } from '../../../subscription/store/store';
import { UserStore } from '../../../users/store/users.store';
import { SubscriptionChartService } from '../../services/SubscriptionChartService.service';

Chart.register(...registerables);

@Component({
  selector: 'app-content-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainChartComponent,
    MiniChartComponentComponent,
    RightChartComponent,
  ],
  templateUrl: './content-dashboard.component.html',
  styleUrls: ['./content-dashboard.component.scss'],
})
export class ContentDashboardComponent implements OnInit {
  // Injection des stores et services
  private subscriptionStore = inject(SubscriptionStore);
  private userStore = inject(UserStore);
  private chartService = inject(SubscriptionChartService);
  private toaster = inject(ToastrService);

  // Indicateur de chargement
  dataLoaded = false;

  // Données des charts
  miniChartData?: ChartDataConfig;
  riskChartData?: ChartDataConfig;
  coverageChartData?: ChartDataConfig;
  performanceChartData?: ChartDataConfig;
  mainChartData?: ChartDataConfig;
  businessUnitData?: ChartDataConfig;

  // Options des charts
  chartOptions: ChartOptions;
  miniChartOptions: ChartOptions;
  mainChartOptions: ChartOptions;
  doughnutOptions: ChartOptions;

  // Listes de types de données et de graphiques
  dataTypes: string[] = [];
  chartTypes: (keyof ChartTypeRegistry)[] = ['line', 'bar', 'pie', 'doughnut'];
  pieChartTypes: (keyof ChartTypeRegistry)[] = ['pie', 'doughnut'];

  // Paramètres des graphiques
  mainChartDataType = 'Average risk over time';
  mainChartType: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';
  businessUnitDataType: string = 'Risk by business unit';
  businessUnitChartType: keyof ChartTypeRegistry = 'doughnut';

  // Signals pour les mini charts (exemples statiques initiaux)
  relationshipsSignal = signal({ count: 852, change: 11 });
  averageRiskSignal = signal({ value: 42, change: 0 });
  coverageSignal = signal({ value: 94, change: 0 });
  performanceSignal = signal({ value: 76, change: 0 });

  // Signals computed pour l'affichage formaté
  formattedRelationships = computed(
    () =>
      `${this.relationshipsSignal().count} (${
        this.relationshipsSignal().change > 0 ? '+' : ''
      }${this.relationshipsSignal().change}%)`
  );
  formattedAverageRisk = computed(() => `${this.averageRiskSignal().value}%`);
  formattedCoverage = computed(() => `${this.coverageSignal().value}%`);
  formattedPerformance = computed(() => `${this.performanceSignal().value}%`);

  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: Date[] = [];
  lastUpdate: Date = new Date();

  totalSubscriptions: number = 0;

  constructor() {
    this.dataTypes = this.chartService.getDataTypes();
    this.chartOptions = this.chartService.getChartOptions();
    this.miniChartOptions = this.chartService.getMiniChartOptions();
    this.mainChartOptions = this.chartOptions;
    this.doughnutOptions = {
      ...this.chartOptions,
      scales: undefined,
    };
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    Promise.all([
      this.subscriptionStore.LoadSubscriptionWithDetails([]),
      this.userStore.loadUsers([]),
    ])
      .then(() => {
        setTimeout(() => {
          this.dataLoaded = true;
          this.updateAllCharts();
          this.updateBusinessUnitChart();
        }, 500);
      })
      .catch((error) => {
        this.toaster.error('Error loading data:', error);
      });
  }

  private updateAllCharts() {
    if (!this.dataLoaded) return;
    {
      const userData = this.chartService.getChartData('User Data');
      const subStatus = this.chartService.getChartData('Subscription Status');
      const subDuration = this.chartService.getChartData(
        'Subscription Duration'
      );

      const labels = subDuration.map((item) => item.label);
      const activeUsersValue =
        userData.find((item) => item.label === 'Active Users')?.value || 0;
      const totalUsersValue =
        userData.find((item) => item.label === 'Total Users')?.value || 0;
      const subActiveValue =
        subStatus.find((item) => item.label === 'Active')?.value || 0;
      const subExpiredValue =
        subStatus.find((item) => item.label === 'Expired')?.value || 0;

      const activeUsersArray = labels.map(() => activeUsersValue);
      const totalUsersArray = labels.map(() => totalUsersValue);
      const subActiveArray = labels.map(() => subActiveValue);
      const subExpiredArray = labels.map(() => subExpiredValue);
      const avgDurationArray = subDuration.map((item) => item.value);

      this.mainChartData = {
        labels,
        datasets: [
          {
            label: 'Total Users',
            data: totalUsersArray,
            backgroundColor: this.chartService.getChartColors().primary.bg,
            borderColor: this.chartService.getChartColors().primary.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Active Users',
            data: activeUsersArray,
            backgroundColor: this.chartService.getChartColors().success.bg,
            borderColor: this.chartService.getChartColors().success.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Active Subscriptions',
            data: subActiveArray,
            backgroundColor: this.chartService.getChartColors().warning.bg,
            borderColor: this.chartService.getChartColors().warning.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Expired Subscriptions',
            data: subExpiredArray,
            backgroundColor: this.chartService.getChartColors().danger.bg,
            borderColor: this.chartService.getChartColors().danger.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Avg Duration (months)',
            data: avgDurationArray,
            backgroundColor: 'rgba(66, 178, 255, 0.1)',
            borderColor: '#66B2FF',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };
    }
    {
      const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
      const activeSubscriptions = subscriptions.filter(
        (sub) => sub.details.status === 'ACTIVE'
      ).length;
      const expiredSubscriptions = subscriptions.filter(
        (sub) => sub.details.status === 'EXPIRED'
      ).length;

      const months = ['Nov', 'Dec', 'Jan', 'Feb'];
      const activeData = months.map(() =>
        Math.floor(
          Math.random() *
            (activeSubscriptions * 1.2 - activeSubscriptions * 0.8) +
            activeSubscriptions * 0.8
        )
      );
      const expiredData = months.map(() =>
        Math.floor(
          Math.random() *
            (expiredSubscriptions * 1.2 - expiredSubscriptions * 0.8) +
            expiredSubscriptions * 0.8
        )
      );

      this.miniChartData = {
        labels: months,
        datasets: [
          {
            label: 'Active',
            data: activeData,
            backgroundColor: this.chartService.getChartColors().success.bg,
            borderColor: this.chartService.getChartColors().success.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Expired',
            data: expiredData,
            backgroundColor: this.chartService.getChartColors().danger.bg,
            borderColor: this.chartService.getChartColors().danger.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };

      this.riskChartData = {
        labels: months,
        datasets: [
          {
            label: 'Risk',
            data: months.map(() => Math.floor(Math.random() * 100)),
            backgroundColor: this.chartService.getChartColors().warning.bg,
            borderColor: this.chartService.getChartColors().warning.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };

      this.coverageChartData = {
        labels: months,
        datasets: [
          {
            label: 'Coverage',
            data: months.map(() => Math.floor(Math.random() * 100)),
            backgroundColor: this.chartService.getChartColors().success.bg,
            borderColor: this.chartService.getChartColors().success.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };

      this.performanceChartData = {
        labels: months,
        datasets: [
          {
            label: 'Performance',
            data: months.map(() => Math.floor(Math.random() * 100)),
            backgroundColor: this.chartService.getChartColors().danger.bg,
            borderColor: this.chartService.getChartColors().danger.base,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };

      // Keep the total subscriptions calculation
      if (this.miniChartData?.datasets?.[0]?.data?.length) {
        this.totalSubscriptions = activeSubscriptions + expiredSubscriptions;
      } else {
        this.totalSubscriptions = 0;
      }
    }
  }

  updateMainChart() {
    if (this.mainChartDataType === 'Risk by business unit') {
      this.updateBusinessUnitChart();
    } else if (this.mainChartDataType === 'Average risk over time') {
      this.updateAllCharts();
    } else {
      this.mainChartData = this.chartService.formatChartData(
        this.mainChartDataType,
        this.mainChartType
      );
    }
  }

  updateBusinessUnitChart() {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const businessUnits = new Map<
      string,
      { totalRisk: number; count: number }
    >();
    const colors = this.chartService.getChartColors();

    subscriptions.forEach((sub) => {
      const unit = sub.details.timeUnit || 'Unknown';
      const risk = sub.details.price || 0;
      if (!businessUnits.has(unit)) {
        businessUnits.set(unit, { totalRisk: 0, count: 0 });
      }
      const current = businessUnits.get(unit)!;
      current.totalRisk += risk;
      current.count += 1;
    });

    const labels = Array.from(businessUnits.keys());
    const riskData = labels.map((unit) => {
      const data = businessUnits.get(unit)!;
      return data.count > 0 ? Math.round(data.totalRisk / data.count) : 0;
    });

    const backgroundColors = labels.map((_, i) => {
      const themeColors = Object.values(colors);
      return themeColors[i % themeColors.length].bg;
    });
    const borderColors = labels.map((_, i) => {
      const themeColors = Object.values(colors);
      return themeColors[i % themeColors.length].base;
    });

    this.businessUnitData = {
      labels,
      datasets: [
        {
          label: 'Average Risk Level',
          data: riskData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };

    this.doughnutOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { size: 14, family: 'shantellasans' },
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart) => {
              const data = chart.data;
              return (
                data.labels?.map((label, i) => ({
                  text: `${label}: ${
                    data.datasets?.[0]?.data[i]?.toLocaleString() ?? 0
                  } Ar`,
                  fillStyle: backgroundColors[i],
                  strokeStyle: borderColors[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                })) || []
              );
            },
          },
        },
        title: {
          display: true,
          color: 'white',
          font: { size: 16, family: 'shantellasans' },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          titleFont: { size: 14, family: 'shantellasans' },
          bodyFont: { size: 12, family: 'shantellasans' },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return ` ${context.label}: ${value.toLocaleString()} Ar`;
            },
          },
        },
      },
      scales: undefined,
    };
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  selectDate(date: Date) {
    this.selectedDate = date;
  }

  refreshData() {
    this.lastUpdate = new Date();
    this.loadInitialData();
  }
}
