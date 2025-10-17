import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const isPositiveTrend = trend && trend.startsWith('+');
  const isNegativeTrend = trend && trend.startsWith('-');

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            isPositiveTrend ? 'text-green-600' : isNegativeTrend ? 'text-red-600' : 'text-gray-600'
          }`}>
            {isPositiveTrend && <TrendingUp className="h-4 w-4 mr-1" />}
            {isNegativeTrend && <TrendingDown className="h-4 w-4 mr-1" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
