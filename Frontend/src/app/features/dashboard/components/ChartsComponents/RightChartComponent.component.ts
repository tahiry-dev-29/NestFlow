import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-right-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas baseChart
        #chart="base-chart"
        [type]="chartType"
        [data]="data"
        [options]="options">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    :host {
      display: block;
      height: 100%;
    }

    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  `]
})
export class RightChartComponent implements OnChanges {
  @Input() data: any;
  @Input() options: ChartOptions = {};
  @Input() chartType: ChartType = 'doughnut';
  @ViewChild('chart') chart?: BaseChartDirective;

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['data'] || changes['options'] || changes['chartType']) && this.chart?.chart) {
      setTimeout(() => {
        this.chart?.chart?.update();
      }, 0);
    }
  }
}
