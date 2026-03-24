import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import { formatCurrency, shortDate } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function TrendChart({ data, currency, label = 'Spending' }) {
  const { dark } = useTheme();

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>;
  }

  const textColor = dark ? '#94a3b8' : '#64748b';
  const gridColor = dark ? '#1e293b' : '#f1f5f9';

  const chartData = {
    labels: data.map(d => shortDate(d._id + '-01' in d ? d._id + '-01' : d._id)),
    datasets: [{
      label,
      data:            data.map(d => d.total),
      borderColor:     '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.08)',
      fill:            true,
      tension:         0.4,
      pointRadius:     3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#0ea5e9',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 }, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: v => formatCurrency(v, currency),
        },
      },
    },
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
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}
