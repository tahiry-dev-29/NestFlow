import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-wrapper">
    <canvas baseChart
            [type]="chartType"
            [data]="data"
            [options]="options">
    </canvas>
  </div>
  `,
  styles: `
    :host {
      display: block;
    }
  .chart-wrapper {
    height: 100px;
  }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniChartComponentComponent {
  @Input() data: any;
  @Input() options: ChartOptions = {};
  @Input() chartType: 'line' | 'bar' | 'radar' | 'doughnut' | 'pie' | 'polarArea' | 'bubble' | 'scatter' = 'line';
}
