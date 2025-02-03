import { Component, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-main-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-body">
      <canvas baseChart [type]="chartType" [data]="data" [options]="options"></canvas>
    </div>
  `,
  styles: [`
    .chart-body {
      height: 300px;
    }
  `],
})
export class MainChartComponent {
  @Input() data: any;
  @Input() options: ChartOptions = {};
  @Input() chartType: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';
}
