import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Search,
  Sparkles,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { weatherAPI } from '../services/api';
import geminiService from '../services/gemini';
import { INDIAN_CITIES } from '../data/indianCities';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCity, setSelectedCity] = useState('Amaravati');
  const [forecastDays, setForecastDays] = useState(7);
  const [weatherData, setWeatherData] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch real weather forecast data
  const fetchWeatherForecast = async (city, days) => {
    setLoading(true);
    toast.loading(`Fetching ${days}-day forecast for ${city}...`, { id: 'forecast' });
    
    try {
      const data = await weatherAPI.getWeatherForecast(city, days);
      setWeatherData(data);
      toast.success(`Forecast loaded for ${city}!`, { id: 'forecast' });
    } catch (error) {
      toast.error('Failed to fetch weather forecast', { id: 'forecast' });
      console.error('Forecast Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI prediction
  const generateAIPrediction = async () => {
    if (!selectedCity) {
      toast.error('Please select a city first');
      return;
    }

    setAiLoading(true);
    toast.loading(`Generating AI prediction for ${selectedCity}...`, { id: 'ai-prediction' });
    
    try {
      const result = await geminiService.generateWeatherPrediction(selectedCity, forecastDays);
      
      if (result.success) {
        setAiPrediction(result.prediction);
        toast.success('AI prediction generated!', { id: 'ai-prediction' });
      } else {
        toast.error('Failed to generate AI prediction', { id: 'ai-prediction' });
      }
    } catch (error) {
      toast.error('Failed to generate AI prediction', { id: 'ai-prediction' });
      console.error('AI Prediction Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchWeatherForecast(selectedCity, forecastDays);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setSelectedCity(searchLocation.trim());
      fetchWeatherForecast(searchLocation.trim(), forecastDays);
    }
  };

  // Real temperature data from forecast
  const temperatureData = weatherData && weatherData.forecast ? 
    weatherData.forecast.forecastday.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avg: parseFloat(day.day.avgtemp_c).toFixed(3),
      max: parseFloat(day.day.maxtemp_c).toFixed(3),
      min: parseFloat(day.day.mintemp_c).toFixed(3)
    })) : [];

  // Real precipitation data from forecast
  const precipitationData = weatherData && weatherData.forecast ? 
    weatherData.forecast.forecastday.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      precipitation: parseFloat(day.day.totalprecip_mm).toFixed(3),
      rain_chance: day.day.daily_chance_of_rain
    })) : [];

  // Real weather patterns from forecast
  const weatherPatterns = weatherData && weatherData.forecast ? (() => {
    const conditions = {};
    weatherData.forecast.forecastday.forEach(day => {
      const condition = day.day.condition.text;
      conditions[condition] = (conditions[condition] || 0) + 1;
    });
    
    const colors = {
      'Sunny': '#fbbf24',
      'Clear': '#fbbf24',
      'Partly cloudy': '#93c5fd',
      'Partly Cloudy': '#93c5fd',
      'Cloudy': '#9ca3af',
      'Overcast': '#9ca3af',
      'Mist': '#cbd5e1',
      'Patchy rain possible': '#60a5fa',
      'Patchy rain nearby': '#60a5fa',
      'Light rain': '#3b82f6',
      'Moderate rain': '#2563eb',
      'Heavy rain': '#1e40af',
      'Thundery outbreaks possible': '#8b5cf6',
      'default': '#6b7280'
    };
    
    return Object.entries(conditions).map(([name, count]) => ({
      name,
      value: Math.round((count / weatherData.forecast.forecastday.length) * 100),
      color: colors[name] || colors['default']
    }));
  })() : [];

  // Real hourly data from current day forecast
  const hourlyData = weatherData && weatherData.forecast && weatherData.forecast.forecastday[0] ? 
    weatherData.forecast.forecastday[0].hour.filter((_, index) => index % 2 === 0).map(hour => ({
      time: new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temp: parseFloat(hour.temp_c).toFixed(3),
      humidity: hour.humidity,
      pressure: hour.pressure_mb,
      wind: parseFloat(hour.wind_kph).toFixed(3)
    })) : [];

  // Calculate KPI data from real weather data
  const kpiData = weatherData && weatherData.forecast ? [
    {
      title: 'Average Temperature',
      value: `${(weatherData.forecast.forecastday.reduce((sum, day) => sum + parseFloat(day.day.avgtemp_c), 0) / weatherData.forecast.forecastday.length).toFixed(1)}°C`,
      change: `${weatherData.forecast.forecastday[0]?.day.avgtemp_c}°C today`,
      trend: parseFloat(weatherData.forecast.forecastday[0]?.day.avgtemp_c) > 25 ? 'up' : 'down',
      icon: Thermometer,
      color: 'text-orange-600'
    },
    {
      title: 'Total Precipitation',
      value: `${weatherData.forecast.forecastday.reduce((sum, day) => sum + parseFloat(day.day.totalprecip_mm), 0).toFixed(1)}mm`,
      change: `${weatherData.forecast.forecastday[0]?.day.totalprecip_mm}mm today`,
      trend: parseFloat(weatherData.forecast.forecastday[0]?.day.totalprecip_mm) > 5 ? 'up' : 'down',
      icon: Droplets,
      color: 'text-blue-600'
    },
    {
      title: 'Average Wind Speed',
      value: `${(weatherData.forecast.forecastday.reduce((sum, day) => sum + parseFloat(day.day.maxwind_kph), 0) / weatherData.forecast.forecastday.length).toFixed(1)} km/h`,
      change: `${weatherData.forecast.forecastday[0]?.day.maxwind_kph} km/h max today`,
      trend: 'up',
      icon: Wind,
      color: 'text-gray-600'
    },
    {
      title: 'Average Humidity',
      value: `${(weatherData.forecast.forecastday.reduce((sum, day) => sum + parseFloat(day.day.avghumidity), 0) / weatherData.forecast.forecastday.length).toFixed(1)}%`,
      change: `${weatherData.forecast.forecastday[0]?.day.avghumidity}% today`,
      trend: parseFloat(weatherData.forecast.forecastday[0]?.day.avghumidity) > 70 ? 'up' : 'down',
      icon: Eye,
      color: 'text-green-600'
    }
  ] : [];

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

      {/* Search and AI Prediction */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
          AI-Powered Weather Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Search City
            </label>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)..."
                className="input-field flex-1"
                list="cities-list"
              />
              <datalist id="cities-list">
                {INDIAN_CITIES.slice(0, 50).map(city => (
                  <option key={city.name} value={city.name}>{city.name}, {city.state}</option>
                ))}
              </datalist>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </form>
          </div>

          {/* Forecast Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Days
            </label>
            <select
              value={forecastDays}
              onChange={(e) => {
                const days = parseInt(e.target.value);
                setForecastDays(days);
                if (selectedCity) {
                  fetchWeatherForecast(selectedCity, days);
                }
              }}
              className="input-field"
            >
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
            </select>
          </div>
        </div>

        {/* AI Prediction Button */}
        <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Currently analyzing: <span className="text-purple-600">{selectedCity}</span>
            </p>
            <p className="text-xs text-gray-500">
              Get AI-powered insights and predictions using Gemini AI
            </p>
          </div>
          <button
            onClick={generateAIPrediction}
            disabled={aiLoading || !selectedCity}
            className="btn-primary disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Prediction
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Prediction Display */}
      {aiPrediction && (
        <div className="card border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              AI Weather Prediction for {selectedCity}
            </h3>
            <button
              onClick={() => setAiPrediction(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {aiPrediction}
            </div>
          </div>
        </div>
      )}

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
          {loading && (
            <div className="flex items-center text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading real weather data...
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {kpiData.length > 0 ? (
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
      ) : (
        <div className="card text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Search for a city above to view weather analytics</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Forecast Trends</h3>
          <div className="h-80">
            {temperatureData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Search for a city to view temperature trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Precipitation Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Precipitation Forecast</h3>
          <div className="h-80">
            {precipitationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precipitationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Precipitation (mm)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Search for a city to view precipitation data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Patterns and Hourly Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Patterns */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Pattern Distribution</h3>
          <div className="h-80">
            {weatherPatterns.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Search for a city to view weather patterns</p>
              </div>
            )}
          </div>
          {weatherPatterns.length > 0 && (
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
          )}
        </div>

        {/* Hourly Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Hourly Weather Trends</h3>
          <div className="h-80">
            {hourlyData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Search for a city to view hourly trends</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary - Real Data */}
      {weatherData && weatherData.forecast && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Summary for {selectedCity}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{forecastDays}</div>
              <div className="text-sm text-gray-500">Days Forecasted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {weatherData.forecast.forecastday[0]?.day.condition.text}
              </div>
              <div className="text-sm text-gray-500">Current Condition</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {typeof weatherData.forecast.forecastday[0]?.day.uv === 'number' 
                  ? weatherData.forecast.forecastday[0].day.uv.toFixed(1)
                  : weatherData.forecast.forecastday[0]?.day.uv || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">UV Index Today</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
