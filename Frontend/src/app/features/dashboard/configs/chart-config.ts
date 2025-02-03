export const ChartColors = {
  primary: {
    base: '#0D6EFD',
    light: '#66B2FF',
    dark: '#0B5ED7',
    bg: 'rgba(13, 110, 253, 0.1)',
  },
  success: {
    base: '#198754',
    light: '#3DDC84',
    dark: '#157347',
    bg: 'rgba(25, 135, 84, 0.1)',
  },
  warning: {
    base: '#FFC107',
    light: '#FFCA2D',
    dark: '#D39E00',
    bg: 'rgba(255, 193, 7, 0.1)',
  },
  danger: {
    base: '#DC3545',
    light: '#FF6B6B',
    dark: '#BB2D3B',
    bg: 'rgba(220, 53, 69, 0.1)',
  },
};

export const ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#FFFFFF',
        font: { family: 'shantellasans' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      titleFont: { family: 'shantellasans' },
      bodyFont: { family: 'shantellasans' },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: '#FFFFFF', font: { family: 'shantellasans' } },
    },
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: '#FFFFFF', font: { family: 'shantellasans' } },
    },
  },
};

export const MiniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#FFFFFF',
        font: { family: 'shantellasans' },
        padding: 20,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      titleFont: { family: 'shantellasans' },
      bodyFont: { family: 'shantellasans' },
      callbacks: {
        label: (context: any) => {
          const value = context.raw as number;
          return `Valeur: ${value.toLocaleString()}`;
        },
      },
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};
