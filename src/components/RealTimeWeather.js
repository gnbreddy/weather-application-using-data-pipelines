import React, { useState, useEffect } from "react";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  Cloud,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { weatherAPI } from "../services/api";

const RealTimeWeather = ({ location = "San Francisco" }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRealTimeWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await weatherAPI.getRealTimeWeather(location);
      setWeatherData(data);
      setLastUpdated(new Date());
      toast.success(`Weather data updated for ${data.location.name}`);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data");
      toast.error("Failed to fetch real-time weather data");
      console.error("Weather API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeWeather();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchRealTimeWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const getWeatherIcon = (condition) => {
    const code = condition?.code;
    if (code >= 1000 && code <= 1003)
      return <Sun className="h-8 w-8 text-yellow-500" />;
    if (code >= 1006 && code <= 1030)
      return <Cloud className="h-8 w-8 text-gray-500" />;
    return <Cloud className="h-8 w-8 text-blue-500" />;
  };

  const getAirQualityColor = (index) => {
    if (index <= 50) return "text-green-600 bg-green-100";
    if (index <= 100) return "text-yellow-600 bg-yellow-100";
    if (index <= 150) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getAirQualityText = (index) => {
    if (index <= 50) return "Good";
    if (index <= 100) return "Moderate";
    if (index <= 150) return "Unhealthy for Sensitive Groups";
    return "Unhealthy";
  };

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Weather Data
            </h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchRealTimeWeather}
              className="btn-primary"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              Loading real-time weather data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { location: loc, current } = weatherData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{loc.name}</h2>
                <p className="text-sm text-gray-500">
                  {loc.region}, {loc.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getWeatherIcon(current.condition)}
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {parseFloat(current.temp_c).toFixed(3)}°C
                </p>
                <p className="text-sm text-gray-500">
                  {current.condition.text}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={fetchRealTimeWeather}
              className="btn-secondary mb-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <Thermometer className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Feels Like</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {parseFloat(current.feelslike_c).toFixed(3)}°C
                </p>
                <p className="text-xs text-gray-500">
                  ({parseFloat(current.feelslike_f).toFixed(3)}°F)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Humidity</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {parseFloat(current.humidity).toFixed(3)}%
                </p>
                <p className="text-xs text-gray-500">
                  Precipitation: {parseFloat(current.precip_mm).toFixed(3)}mm
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <Wind className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Wind</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {parseFloat(current.wind_kph).toFixed(3)} km/h
                </p>
                <p className="text-xs text-gray-500">
                  {current.wind_dir} • Gust:{" "}
                  {parseFloat(current.gust_kph).toFixed(3)} km/h
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Visibility</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {parseFloat(current.vis_km).toFixed(3)} km
                </p>
                <p className="text-xs text-gray-500">
                  UV Index: {parseFloat(current.uv).toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="metric-card">
          <div className="flex items-center">
            <Gauge className="h-5 w-5 text-gray-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Pressure</p>
              <p className="text-lg font-semibold text-gray-900">
                {parseFloat(current.pressure_mb).toFixed(3)} mb
              </p>
              <p className="text-xs text-gray-500">
                {parseFloat(current.pressure_in).toFixed(3)} in
              </p>
            </div>
          </div>
        </div>

        {current.air_quality && (
          <div className="metric-card">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${
                  getAirQualityColor(current.air_quality.pm2_5).split(" ")[1]
                }`}
              >
                <Wind
                  className={`h-5 w-5 ${
                    getAirQualityColor(current.air_quality.pm2_5).split(" ")[0]
                  }`}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Air Quality</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getAirQualityText(current.air_quality.pm2_5)}
                </p>
                <p className="text-xs text-gray-500">
                  PM2.5: {parseFloat(current.air_quality.pm2_5).toFixed(3)}{" "}
                  μg/m³
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="metric-card">
          <div className="flex items-center">
            <Sun className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Cloud Cover</p>
              <p className="text-lg font-semibold text-gray-900">
                {parseFloat(current.cloud).toFixed(3)}%
              </p>
              <p className="text-xs text-gray-500">
                UV Index: {parseFloat(current.uv).toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Conditions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 text-sm">
          <div>
            <span className="text-gray-500">Local Time:</span>
            <p className="font-medium">{loc.localtime}</p>
          </div>
          <div>
            <span className="text-gray-500">Temperature:</span>
            <p className="font-medium">
              {parseFloat(current.temp_c).toFixed(3)}°C /{" "}
              {parseFloat(current.temp_f).toFixed(3)}°F
            </p>
          </div>
          <div>
            <span className="text-gray-500">Condition:</span>
            <p className="font-medium">{current.condition.text}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <p className="font-medium">{current.last_updated}</p>
          </div>
        </div>

        {/* Coordinates and Precision Info */}
        {loc.coordinates && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 text-sm">
              <div>
                <span className="text-gray-500">Coordinates:</span>
                <p className="font-medium">
                  {loc.coordinates.lat}, {loc.coordinates.lon}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Data Source:</span>
                <p className="font-medium">Tomorrow.io API</p>
              </div>
              <div>
                <span className="text-gray-500">Precision:</span>
                <p className="font-medium">4 decimal places</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Detailed Weather Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precision
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Temperature
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.temp_c).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  °C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Feels Like
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.feelslike_c).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  °C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Humidity
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.humidity).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  %
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Wind Speed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.wind_kph).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  km/h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Visibility
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.vis_km).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Pressure
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.pressure_mb).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  mb
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Air Quality (PM2.5)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {current.air_quality?.pm2_5
                    ? parseFloat(current.air_quality.pm2_5).toFixed(3)
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  μg/m³
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cloud Cover
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.cloud).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  %
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  UV Index
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(current.uv).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  index
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3 decimals
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RealTimeWeather;
