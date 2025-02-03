import { Component, Input } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-right-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-body">
      <canvas baseChart [type]="chartType" [data]="data" [options]="options">
      </canvas>
    </div>
  `,

  styles: `
.chart-body {
  height: 250px;
}

  `,
})
export class RightChartComponent {
  @Input() data: any;
  @Input() options: ChartOptions = {};
  @Input() chartType: ChartType = 'doughnut';
}
