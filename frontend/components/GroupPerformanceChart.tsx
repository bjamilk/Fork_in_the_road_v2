
import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartConfiguration, TooltipItem } from 'chart.js';
Chart.register(...registerables); // Register all controllers, elements, scales, and plugins

export interface ChartDataPoint {
  x: string; // Label for x-axis (e.g., "Test 1", "2023-10-26")
  y: number; // Score
}

interface GroupPerformanceChartProps {
  groupName: string;
  data: ChartDataPoint[];
  theme: 'light' | 'dark';
  type: 'bar' | 'line';
}

const GroupPerformanceChart: React.FC<GroupPerformanceChartProps> = ({ groupName, data, theme, type }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); // Destroy previous instance
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
        const ticksColor = theme === 'dark' ? '#cbd5e1' : '#4b5563'; // Tailwind slate-300 and gray-600
        
        const chartColor = theme === 'dark' ? 'rgba(56, 189, 248, 1)' : 'rgba(59, 130, 246, 1)'; // sky-400 / blue-500
        const chartBgColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.65)' : 'rgba(59, 130, 246, 0.65)';
        const chartHoverBgColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.85)' : 'rgba(59, 130, 246, 0.85)';
        
        const tooltipBackgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'; // slate-800 and white
        const tooltipTitleColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'; // slate-100 and slate-900
        const tooltipBodyColor = theme === 'dark' ? '#e2e8f0' : '#334155'; // slate-200 and slate-700

        let datasetOptions: any;

        if (type === 'line') {
            datasetOptions = {
                borderColor: chartColor,
                backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: chartColor,
                pointRadius: 3,
                pointHoverRadius: 5,
            };
        } else { // bar
            datasetOptions = {
                backgroundColor: chartBgColor,
                borderColor: chartColor,
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: chartHoverBgColor,
                hoverBorderColor: chartColor,
            };
        }

        const chartConfig: ChartConfiguration = {
          type: type,
          data: {
            labels: data.map(d => d.x),
            datasets: [{
              label: `Score`,
              data: data.map(d => d.y),
              ...datasetOptions
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: { display: false },
                grid: { color: gridColor },
                ticks: { color: ticksColor, padding: 8, callback: (value) => `${value}%` }
              },
              x: {
                title: { display: false },
                grid: { display: false },
                ticks: { color: ticksColor, padding: 8 }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                backgroundColor: tooltipBackgroundColor,
                titleColor: tooltipTitleColor,
                bodyColor: tooltipBodyColor,
                borderColor: gridColor,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4,
                displayColors: false, 
                callbacks: {
                  label: function(context: TooltipItem<any>) {
                    return `Score: ${context.formattedValue}%`;
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index',
            },
          }
        };

        chartInstanceRef.current = new Chart(ctx, chartConfig);
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, groupName, theme, type]);

  if (data.length === 0) {
     return (
        <div className="text-center py-6 px-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-md mt-3">
            <p>No test data available for this view.</p>
        </div>
        );
  }

  if (type === 'line' && data.length < 2) {
      return (
        <div className="text-center py-6 px-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-md mt-3">
            <p>At least 2 weeks of data are needed to show a trend.</p>
        </div>
        );
  }


  return (
    <div className="h-60 md:h-64 my-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-inner">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GroupPerformanceChart;