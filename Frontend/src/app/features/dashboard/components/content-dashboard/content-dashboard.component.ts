import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { SubscriptionStore } from '../../../subscription/store/store';
import { UserStore } from '../../../users/store/users.store';
import { SubscriptionChartService } from '../../services/SubscriptionChartService.service';
import { MainChartComponent } from "../ChartsComponents/MainChartComponent.component";
import { MiniChartComponentComponent } from "../ChartsComponents/MiniChartComponent.component";
import { RightChartComponent } from "../ChartsComponents/RightChartComponent.component";
import { ChartDataConfig } from '../../models/chart.model';


// Enregistrer tous les composants Chart.js nécessaires
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
  private dataLoaded = false;

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
  pieChartTypes: (keyof ChartTypeRegistry)[] = ['pie', 'doughnut', 'polarArea'];

  // Calendrier et mises à jour
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: Date[] = [];

  lastUpdate: Date = new Date();

  // Paramètres des charts
  mainChartDataType = 'User Data';
  mainChartType: 'bar' | 'line' | 'scatter' | 'pie' | 'doughnut' | 'radar' = 'bar';
  businessUnitChartType: keyof ChartTypeRegistry = 'doughnut';

  constructor(private chartService: SubscriptionChartService) {
    this.dataTypes = this.chartService.getDataTypes();
    this.chartTypes = ['line', 'bar', 'pie', 'doughnut'];
    
    // Initialisation des options de chart
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
      }, 100);
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }

  private updateAllCharts() {
    if (!this.dataLoaded) return;
    
    this.mainChartData = this.chartService.formatChartData(this.mainChartDataType, this.mainChartType);
    this.businessUnitData = this.chartService.formatChartData('Business Unit', this.businessUnitChartType);
    
    // Pour les mini charts, on simule des données différentes pour l’exemple
    this.miniChartData = this.chartService.formatChartData('Mini Data', 'line');
    this.riskChartData = this.chartService.formatChartData('Risk Data', 'line');
    this.coverageChartData = this.chartService.formatChartData('Coverage Data', 'line');
    this.performanceChartData = this.chartService.formatChartData('Performance Data', 'line');
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
