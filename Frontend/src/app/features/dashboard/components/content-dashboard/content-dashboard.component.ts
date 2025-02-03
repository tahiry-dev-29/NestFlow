import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { SubscriptionStore } from '../../../subscription/store/store';
import { UserStore } from '../../../users/store/users.store';
import { MainChartComponent } from '../ChartsComponents/MainChartComponent.component';
import { MiniChartComponentComponent } from '../ChartsComponents/MiniChartComponent.component';
import { RightChartComponent } from '../ChartsComponents/RightChartComponent.component';
import { ChartDataConfig } from '../../models/chart.model';
import { SubscriptionChartService } from '../../services/SubscriptionChartService.service';
import { ToastrService } from 'ngx-toastr';

// Enregistrer les composants Chart.js nécessaires
Chart.register(...registerables);

@Component({
  selector: 'app-content-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MainChartComponent, MiniChartComponentComponent, RightChartComponent],
  templateUrl: './content-dashboard.component.html',
  styleUrls: ['./content-dashboard.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class ContentDashboardComponent implements OnInit {
  private subscriptionStore = inject(SubscriptionStore);
  private userStore = inject(UserStore);
  private chartService = inject(SubscriptionChartService);
  private dataLoaded = false;
  private readonly toaster = inject(ToastrService);

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

  // Listes et sélections
  dataTypes: string[] = [];
  chartTypes: (keyof ChartTypeRegistry)[] = ['line', 'bar', 'pie', 'doughnut'];
  pieChartTypes: (keyof ChartTypeRegistry)[] = ['pie', 'doughnut', 'polarArea', 'radar'];

  // Autres propriétés
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: Date[] = [];
  lastUpdate: Date = new Date();

  // Paramètres des charts
  mainChartDataType = 'Average risk over time';
  mainChartType: 'bar' | 'line' | 'scatter' | 'pie' | 'doughnut' = 'bar';
  businessUnitDataType: string = 'Risk by business unit';
  businessUnitChartType: keyof ChartTypeRegistry = 'doughnut';

  // Signals pour les mini charts (exemple : Relationships, Average Risk, Coverage, Performance)
  relationshipsSignal = signal({ count: 852, change: 11 });
  averageRiskSignal = signal({ value: 42, change: 0 });
  coverageSignal = signal({ value: 94, change: 0 });
  performanceSignal = signal({ value: 76, change: 0 });

  // Exemple de computed signal pour formater l'affichage (nombre et pourcentage)
  formattedRelationships = computed(() =>
    `${this.relationshipsSignal().count} (${this.relationshipsSignal().change > 0 ? '+' : ''}${this.relationshipsSignal().change}%)`
  );
  formattedAverageRisk = computed(() =>
    `${this.averageRiskSignal().value}%`
  );
  formattedCoverage = computed(() =>
    `${this.coverageSignal().value}%`
  );
  formattedPerformance = computed(() =>
    `${this.performanceSignal().value}%`
  );

  constructor() {
    this.dataTypes = this.chartService.getDataTypes();
    this.chartTypes = ['line', 'bar', 'pie', 'doughnut', 'scatter'];

    this.chartOptions = this.chartService.getChartOptions();
    this.miniChartOptions = this.chartService.getMiniChartOptions();
    this.mainChartOptions = this.chartOptions;
    this.doughnutOptions = { ...this.chartOptions, scales: undefined };
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    Promise.all([
      this.subscriptionStore.LoadSubscriptionWithDetails([]),
      this.userStore.loadUsers([])
    ]).then(() => {
      setTimeout(() => {
        this.dataLoaded = true;
        this.updateAllCharts();
      }, 500);
    }).catch(error => {
      this.toaster.error('Error loading data:', error);
    });
  }

  private updateAllCharts() {
    if (!this.dataLoaded) return;

    // *** MAIN CHART : "Average risk over time" ***
    {
      const userData = this.chartService.getChartData('User Data');            // [Active Users, Total Users]
      const subStatus = this.chartService.getChartData('Subscription Status');   // [Active, Expired]
      const subDuration = this.chartService.getChartData('Subscription Duration'); // Données mensuelles

      const labels = subDuration.map(item => item.label);
      const activeUsersValue = userData.find(item => item.label === 'Active Users')?.value || 0;
      const totalUsersValue = userData.find(item => item.label === 'Total Users')?.value || 0;
      const subActiveValue = subStatus.find(item => item.label === 'Active')?.value || 0;
      const subExpiredValue = subStatus.find(item => item.label === 'Expired')?.value || 0;
      
      // On duplique les valeurs globales sur chaque mois
      const activeUsersArray = labels.map(() => activeUsersValue);
      const totalUsersArray = labels.map(() => totalUsersValue);
      const subActiveArray = labels.map(() => subActiveValue);
      const subExpiredArray = labels.map(() => subExpiredValue);
      const avgDurationArray = subDuration.map(item => item.value);

      this.mainChartData = {
        labels,
        datasets: [
          {
            label: 'Total Users',
            data: totalUsersArray,
            backgroundColor: 'rgba(13, 110, 253, 0.1)', // primary.bg
            borderColor: '#0D6EFD',                      // primary.base
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Active Users',
            data: activeUsersArray,
            backgroundColor: 'rgba(25, 135, 84, 0.1)', // success.bg
            borderColor: '#198754',                     // success.base
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Active Subscriptions',
            data: subActiveArray,
            backgroundColor: 'rgba(255, 193, 7, 0.1)', // warning.bg
            borderColor: '#FFC107',                    // warning.base
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Expired Subscriptions',
            data: subExpiredArray,
            backgroundColor: 'rgba(220, 53, 69, 0.1)', // danger.bg
            borderColor: '#DC3545',                    // danger.base
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Avg Duration (months)',
            data: avgDurationArray,
            backgroundColor: 'rgba(66, 178, 255, 0.1)', // Exemple avec une couleur complémentaire
            borderColor: '#66B2FF',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      };
    }

    // *** BUSINESS UNIT CHART : "Risk by business unit" ***
    {
      const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
      const priceByType: Record<string, number> = {};
      const premiumByType: Record<string, number> = {};

      subscriptions.forEach(sub => {
        const type = sub.details.subscriptionType || 'Unknown';
        priceByType[type] = (priceByType[type] || 0) + (sub.details.price || 0);
        // Ici, on suppose que "premium" est une propriété numérique présente dans sub.details
        // premiumByType[type] = (premiumByType[type] || 0) + (sub.details.subscriptionType. || 0);
      });

      const labels = Object.keys(priceByType);
      // Pour afficher des couleurs différentes, nous construisons des tableaux de couleurs à partir de notre service
      const colors = this.chartService.getChartColors();
      const totalPriceColors = labels.map(() => colors.success.base);
      const totalPriceBg = labels.map(() => colors.success.bg);
      const totalPremiumColors = labels.map(() => colors.warning.base);
      const totalPremiumBg = labels.map(() => colors.warning.bg);

      this.businessUnitData = {
        labels,
        datasets: [
          {
            label: 'Total Price',
            data: labels.map(label => priceByType[label]),
            backgroundColor: totalPriceBg,
            borderColor: totalPriceColors,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Total Premium',
            data: labels.map(label => premiumByType[label]),
            backgroundColor: totalPremiumBg,
            borderColor: totalPremiumColors,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      };
    }

    // *** MINI CHARTS ***
    // Pour cet exemple, nous mettons à jour les signals (le calcul automatique pourrait être basé sur des données réelles)
    this.relationshipsSignal.set({ count: 852, change: 11 });
    this.averageRiskSignal.set({ value: 42, change: 0 });
    this.coverageSignal.set({ value: 94, change: 0 });
    this.performanceSignal.set({ value: 76, change: 0 });

    // On crée des mini charts avec des données simulées (les valeurs affichées dans le texte seront issues des computed signals)
    this.miniChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Relationships',
        data: [852, 860, 855, 852],
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderColor: '#0D6EFD',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };

    this.riskChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Average Risk',
        data: [42, 40, 43, 42],
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderColor: '#FFC107',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };

    this.coverageChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Coverage',
        data: [94, 93, 95, 94],
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        borderColor: '#198754',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };

    this.performanceChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Performance',
        data: [76, 77, 75, 76],
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderColor: '#DC3545',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };
  }

  updateMainChart() {
    if (this.mainChartDataType === 'Risk by business unit') {
      // Calcul spécifique pour Risk by business unit
      const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
      const businessUnits = new Map<string, { totalRisk: number; count: number }>();
      const colors = this.chartService.getChartColors();
  
      // Calculer la moyenne des risques par unité
      subscriptions.forEach(sub => {
        const unit = sub.details.timeUnit || 'Unknown';
        const risk = sub.details.price || 0;
        
        if (!businessUnits.has(unit)) {
          businessUnits.set(unit, { totalRisk: 0, count: 0 });
        }
        const data = businessUnits.get(unit)!;
        data.totalRisk += risk;
        data.count += 1;
      });
  
      const labels = Array.from(businessUnits.keys());
      const riskData = labels.map(unit => {
        const data = businessUnits.get(unit)!;
        return data.count > 0 ? Math.round(data.totalRisk / data.count) : 0;
      });
  
      // Créer des tableaux de couleurs
      const backgroundColors = labels.map((_, i) => 
        Object.values(colors)[i % Object.keys(colors).length].bg
      );
      const borderColors = labels.map((_, i) => 
        Object.values(colors)[i % Object.keys(colors).length].base
      );
  
      this.mainChartData = {
        labels,
        datasets: [{
          label: 'Average Risk Level',
          data: riskData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          tension: 0.4
        }]
      };
  
      // Ajuster les options selon le type de graphique
      this.mainChartOptions = {
        ...this.chartOptions,
        scales: (this.mainChartType === 'pie' || this.mainChartType === 'doughnut') 
          ? undefined 
          : this.chartOptions.scales,
        plugins: {
          ...this.chartOptions.plugins,
          legend: {
            display: true,
            position: 'right',
            labels: { color: '#ffffff' }
          }
        }
      };
    } else if (this.mainChartDataType === 'Average risk over time') {
      this.updateAllCharts();
    } else {
      this.mainChartData = this.chartService.formatChartData(this.mainChartDataType, this.mainChartType);
      // ...existing code for other chart types...
    }
  }

  updateBusinessUnitChart() {
    const subscriptions = this.subscriptionStore.subscriptionsWithDetails();
    const businessUnits: Record<string, { revenue: number; count: number }> = {};
    const colors = this.chartService.getChartColors();

    // Regrouper les données par unité
    subscriptions.forEach(sub => {
      const type = sub.details.subscriptionType || 'Unknown';
      if (!businessUnits[type]) {
        businessUnits[type] = { revenue: 0, count: 0 };
      }
      businessUnits[type].revenue += sub.details.price || 0;
      businessUnits[type].count += 1;
    });

    const labels = Object.keys(businessUnits);

    // Définir un ensemble fixe de couleurs
    const colorScheme = [
      { bg: 'rgba(13, 110, 253, 0.7)', border: '#0D6EFD' },  // primary
      { bg: 'rgba(25, 135, 84, 0.7)', border: '#198754' },   // success
      { bg: 'rgba(255, 193, 7, 0.7)', border: '#FFC107' },   // warning
      { bg: 'rgba(220, 53, 69, 0.7)', border: '#DC3545' },   // danger
      { bg: 'rgba(66, 178, 255, 0.7)', border: '#66B2FF' }   // info
    ];

    this.businessUnitData = {
      labels,
      datasets: [{
        data: labels.map(label => businessUnits[label].revenue),
        backgroundColor: labels.map((_, i) => colorScheme[i % colorScheme.length].bg),
        borderColor: labels.map((_, i) => colorScheme[i % colorScheme.length].border),
        borderWidth: 2
      }]
    };

    // Mise à jour des options spécifiques pour le doughnut chart
    this.doughnutOptions = {
      maintainAspectRatio: false,
      // cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#ffffff',
            font: { size: 12, family: 'shantellasans' },
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels?.map((label, i) => ({
                text: `${label}: ${data.datasets?.[0]?.data[i]?.toLocaleString() ?? 0}€`,
                fillStyle: colorScheme[i % colorScheme.length].bg,
                strokeStyle: colorScheme[i % colorScheme.length].border,
                lineWidth: 2,
                hidden: false,
                index: i
              })) || [];
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { size: 14, family: 'shantellasans' },
          bodyFont: { size: 12, family: 'shantellasans' },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return ` ${context.label}: ${value.toLocaleString()}€`;
            }
          }
        }
      }
    };
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDate?.toDateString() === date.toDateString();
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
