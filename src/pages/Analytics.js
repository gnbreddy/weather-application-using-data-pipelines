import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  // Mock data for charts
  const temperatureData = [
    { month: 'Jan', avg: 15, max: 22, min: 8 },
    { month: 'Feb', avg: 17, max: 25, min: 10 },
    { month: 'Mar', avg: 20, max: 28, min: 12 },
    { month: 'Apr', avg: 23, max: 32, min: 15 },
    { month: 'May', avg: 26, max: 35, min: 18 },
    { month: 'Jun', avg: 29, max: 38, min: 21 },
    { month: 'Jul', avg: 31, max: 40, min: 23 },
    { month: 'Aug', avg: 30, max: 39, min: 22 },
    { month: 'Sep', avg: 27, max: 36, min: 19 },
    { month: 'Oct', avg: 24, max: 33, min: 16 },
    { month: 'Nov', avg: 19, max: 27, min: 11 },
    { month: 'Dec', avg: 16, max: 24, min: 9 }
  ];

  const precipitationData = [
    { month: 'Jan', precipitation: 120 },
    { month: 'Feb', precipitation: 95 },
    { month: 'Mar', precipitation: 110 },
    { month: 'Apr', precipitation: 85 },
    { month: 'May', precipitation: 60 },
    { month: 'Jun', precipitation: 25 },
    { month: 'Jul', precipitation: 15 },
    { month: 'Aug', precipitation: 20 },
    { month: 'Sep', precipitation: 45 },
    { month: 'Oct', precipitation: 80 },
    { month: 'Nov', precipitation: 105 },
    { month: 'Dec', precipitation: 130 }
  ];

  const weatherPatterns = [
    { name: 'Sunny', value: 45, color: '#fbbf24' },
    { name: 'Partly Cloudy', value: 25, color: '#93c5fd' },
    { name: 'Cloudy', value: 15, color: '#9ca3af' },
    { name: 'Rainy', value: 10, color: '#3b82f6' },
    { name: 'Snowy', value: 5, color: '#e5e7eb' }
  ];

  const hourlyData = [
    { time: '00:00', temp: 18, humidity: 70, pressure: 1013 },
    { time: '02:00', temp: 17, humidity: 72, pressure: 1012 },
    { time: '04:00', temp: 16, humidity: 75, pressure: 1011 },
    { time: '06:00', temp: 17, humidity: 73, pressure: 1012 },
    { time: '08:00', temp: 19, humidity: 68, pressure: 1013 },
    { time: '10:00', temp: 22, humidity: 62, pressure: 1014 },
    { time: '12:00', temp: 25, humidity: 55, pressure: 1015 },
    { time: '14:00', temp: 27, humidity: 50, pressure: 1014 },
    { time: '16:00', temp: 26, humidity: 52, pressure: 1013 },
    { time: '18:00', temp: 24, humidity: 58, pressure: 1012 },
    { time: '20:00', temp: 21, humidity: 65, pressure: 1011 },
    { time: '22:00', temp: 19, humidity: 68, pressure: 1012 }
  ];

  const kpiData = [
    {
      title: 'Average Temperature',
      value: '22.5°C',
      change: '+2.3°C',
      trend: 'up',
      icon: Thermometer,
      color: 'text-orange-600'
    },
    {
      title: 'Total Precipitation',
      value: '850mm',
      change: '-15%',
      trend: 'down',
      icon: Droplets,
      color: 'text-blue-600'
    },
    {
      title: 'Average Wind Speed',
      value: '12.3 km/h',
      change: '+0.8 km/h',
      trend: 'up',
      icon: Wind,
      color: 'text-gray-600'
    },
    {
      title: 'Data Quality Score',
      value: '99.6%',
      change: '+0.2%',
      trend: 'up',
      icon: Eye,
      color: 'text-green-600'
    }
  ];

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const metrics = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'precipitation', label: 'Precipitation' },
    { value: 'humidity', label: 'Humidity' },
    { value: 'wind', label: 'Wind Speed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Weather Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive weather data analysis and insights
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field w-auto"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="input-field w-auto"
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                  </div>
                </div>
                <div className={`flex items-center text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {kpi.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Temperature Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="Average" />
                <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={2} name="Maximum" />
                <Line type="monotone" dataKey="min" stroke="#06b6d4" strokeWidth={2} name="Minimum" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precipitation Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Precipitation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={precipitationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weather Patterns and Hourly Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Patterns */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Pattern Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weatherPatterns}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {weatherPatterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {weatherPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: pattern.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{pattern.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{pattern.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">24-Hour Weather Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="temp" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="humidity" orientation="right" stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} name="Temperature (°C)" />
                <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">2.3M</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">99.6%</div>
            <div className="text-sm text-gray-500">Data Quality</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">13 Years</div>
            <div className="text-sm text-gray-500">Historical Data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
