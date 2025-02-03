import { Component, Input } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-right-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-body">
      <canvas
        baseChart
        [type]="chartType"
        [data]="data"
        [options]="chartOptions"
      >
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
  @Input() set options(value: ChartOptions) {
    this.chartOptions = {
      ...value,
      plugins: {
        ...value.plugins,
        legend: {
          ...value.plugins?.legend,
          labels: {
            color: 'white',
            font: {
              size: 12,
            },
          },
        },
      },
    };
  }
  @Input() chartType: ChartType = 'doughnut';

  chartOptions: ChartOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 12,
          },
        },
      },
    },
  };
}
