import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORY_COLORS, formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart({ data, currency }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data for this period
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d._id),
    datasets: [{
      data:            data.map(d => d.total),
      backgroundColor: data.map(d => CATEGORY_COLORS[d._id] + 'cc'),
      borderColor:     data.map(d => CATEGORY_COLORS[d._id]),
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.raw, currency)}`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Donut */}
      <div className="w-44 h-44 flex-shrink-0">
        <Doughnut data={chartData} options={options} />
      </div>
      {/* Legend */}
      <div className="flex-1 w-full space-y-2">
        {data.map(d => {
          const color = CATEGORY_COLORS[d._id] || '#94a3b8';
          const total = data.reduce((s, x) => s + x.total, 0);
          const pct   = total ? ((d.total / total) * 100).toFixed(1) : 0;
          return (
            <div key={d._id} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{d._id}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(d.total, currency)}</span>
              <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
