import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { SubscriptionStore } from '../../../subscription/store/store';
import { UserStore } from '../../../users/store/users.store';
import { ChartDataConfig, SubscriptionChartService } from '../../services/SubscriptionChartService.service';

// Enregistrer tous les composants Chart.js nécessaires
Chart.register(...registerables);

@Component({
  selector: 'app-content-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
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
  private dataLoaded = false;

  // Chart Data
  miniChartData?: ChartDataConfig;
  riskChartData?: ChartDataConfig;
  coverageChartData?: ChartDataConfig;
  performanceChartData?: ChartDataConfig;
  mainChartData?: ChartDataConfig;
  businessUnitData?: ChartDataConfig;

  // Chart Options
  chartOptions: ChartOptions;
  miniChartOptions: ChartOptions;
  mainChartOptions: ChartOptions;
  doughnutOptions: ChartOptions;

  // Lists
  dataTypes: string[] = [];
  chartTypes: (keyof ChartTypeRegistry)[] = ['line', 'bar', 'pie', 'doughnut'];
  pieChartTypes: (keyof ChartTypeRegistry)[] = ['pie', 'doughnut', 'polarArea'];

  // Calendar
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: Date[] = [];

  lastUpdate: Date = new Date();

  // Chart settings
  mainChartDataType = 'User Data';
  mainChartType: keyof ChartTypeRegistry = 'bar';
  businessUnitChartType: keyof ChartTypeRegistry = 'doughnut';

  constructor(private chartService: SubscriptionChartService) {
    this.dataTypes = this.chartService.getDataTypes();
    this.chartTypes = ['line', 'bar', 'pie', 'doughnut'];
    
    // Initialize chart options
    this.chartOptions = this.chartService.getChartOptions();
    this.miniChartOptions = this.chartService.getMiniChartOptions();
    this.mainChartOptions = this.chartOptions;
    this.doughnutOptions = { ...this.chartOptions, scales: undefined };
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Un seul appel pour charger les données
    Promise.all([
      this.subscriptionStore.LoadSubscriptionWithDetails([]),
      this.userStore.loadUsers([])
    ]).then(() => {
      setTimeout(() => {
        this.dataLoaded = true;
        this.updateAllCharts();
      }, 2000);
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }

  private updateAllCharts() {
    if (!this.dataLoaded) return;
    
    this.mainChartData = this.chartService.formatChartData(this.mainChartDataType, this.mainChartType);
    this.businessUnitData = this.chartService.formatChartData('Business Unit', this.businessUnitChartType);
  }

  updateMainChart() {
    this.mainChartData = this.chartService.formatChartData(
      this.mainChartDataType, 
      this.mainChartType
    );
    
    this.mainChartOptions = {
      ...this.chartOptions,
      scales: this.mainChartType === 'pie' || this.mainChartType === 'doughnut' 
        ? undefined 
        : this.chartOptions.scales,
      plugins: {
        ...this.chartOptions.plugins,
        legend: {
          display: this.mainChartType === 'pie' || this.mainChartType === 'doughnut',
          position: 'right',
          labels: { color: 'white' }
        }
      }
    };
  }

  updateBusinessUnitChart() {
    this.doughnutOptions = {
      ...this.chartOptions,
      scales: undefined,
      plugins: {
        legend: {
          position: this.businessUnitChartType === 'polarArea' ? 'right' : 'bottom',
          labels: { color: 'white' }
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
