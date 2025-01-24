import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SubscriptionChartService, ChartDataConfig } from '../../services/SubscriptionChartService.service';
import { ChartTypeRegistry } from 'chart.js';
import { animate, style, transition, trigger } from '@angular/animations';

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
  // Chart Data
  miniChartData: ChartDataConfig;
  riskChartData: ChartDataConfig;
  coverageChartData: ChartDataConfig;
  performanceChartData: ChartDataConfig;
  mainChartData: ChartDataConfig;
  businessUnitData: ChartDataConfig;

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

  // Restore required properties for charts
  mainChartDataType = 'User Data';
  mainChartType: keyof ChartTypeRegistry = 'bar';
  businessUnitChartType: keyof ChartTypeRegistry = 'doughnut';

  constructor(private chartService: SubscriptionChartService) {
    this.dataTypes = this.chartService.getDataTypes();
    this.chartTypes = ['line', 'bar', 'pie', 'doughnut']; // Simplified chart types
    
    // Initialize chart data
    this.miniChartData = this.chartService.getMiniChartData() as ChartDataConfig;
    this.riskChartData = this.chartService.getRiskChartData() as ChartDataConfig;
    this.coverageChartData = this.chartService.getCoverageChartData() as ChartDataConfig;
    this.performanceChartData = this.chartService.getPerformanceChartData() as ChartDataConfig;
    this.mainChartData = this.chartService.formatChartData(this.mainChartDataType, this.mainChartType) as ChartDataConfig;
    this.businessUnitData = this.chartService.formatChartData('Business Unit', 'doughnut') as ChartDataConfig;

    // Initialize options
    this.chartOptions = this.chartService.getChartOptions() as ChartOptions;
    this.miniChartOptions = this.chartService.getMiniChartOptions();
    this.mainChartOptions = this.chartOptions;
    this.doughnutOptions = { ...this.chartOptions, scales: undefined };
  }

  ngOnInit() {
    this.generateCalendarDays();
    this.updateMainChart();
    this.updateBusinessUnitChart();
  }

  updateMainChart() {
    this.mainChartData = this.chartService.formatChartData(
      this.mainChartDataType, 
      this.mainChartType
    ) as ChartDataConfig;
    
    // Mettre à jour les options en fonction du type
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

  // Calendar methods
  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    this.calendarDays = Array.from(
      { length: lastDay.getDate() },
      (_, i) => new Date(year, month, i + 1)
    );
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    this.generateCalendarDays();
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
    this.updateMainChart();
    this.updateBusinessUnitChart();
  }
}
