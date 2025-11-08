import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Radio,
  MapPin, 
  Navigation,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import WeatherChart from '../components/WeatherChart';
import MetricCard from '../components/MetricCard';
import StatusIndicator from '../components/StatusIndicator';

import LocationPermission from '../components/LocationPermission';
import { weatherAPI } from '../services/api';
import { getUserLocation } from '../services/geolocation';

const Dashboard = () => {
  const [realTimeWeather, setRealTimeWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Fetch real-time weather data
  useEffect(() => {
    const fetchWeatherData = async (location = 'amaravati,522237') => {
      try {
        const data = await weatherAPI.getRealTimeWeather(location);
        setRealTimeWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        toast.error('Failed to load real-time weather data');
      }
    };

    // Force use Amaravati as the default location (override user location)
    const initializeWeather = async () => {
      console.log('🏙️ Using fixed location: Amaravati');
      
      // Set a mock user location for Amaravati
      setUserLocation({
        city: 'Amaravati',
        state: 'Andhra Pradesh',
        country: 'India',
        coordinates: {
          lat: '16.5062',
          lon: '80.6480'
        },
        source: 'fixed'
      });
      
      // Always fetch weather for Amaravati
      fetchWeatherData('amaravati,522237');
    };

    initializeWeather();
    
    // Refresh every 5 minutes - always use Amaravati
    const interval = setInterval(() => {
      console.log('🔄 Refreshing weather data for Amaravati');
      fetchWeatherData('amaravati,522237');
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // Remove userLocation dependency to prevent infinite loop

  // Check permission status before requesting
  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check error:', error);
      return 'unknown';
    }
  };

  // Handle manual location request
  const handleEnableLocation = async () => {
    setLocationLoading(true);
    
    try {
      // First check current permission status
      const permissionStatus = await checkLocationPermission();
      console.log('Current permission status:', permissionStatus);
      
      if (permissionStatus === 'denied') {
        setLocationDenied(true);
        toast.error(
          'Location access was previously denied. Please reset permissions in your browser settings.',
          { 
            id: 'location-request',
            duration: 6000
          }
        );
        setLocationLoading(false);
        return;
      }

      toast.loading('Requesting location permission...', { id: 'location-request' });
      
      // Try to get location with explicit permission request
      const location = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Force fresh location
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Reverse geocode the coordinates
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`
              );
              
              if (!response.ok) {
                throw new Error('Reverse geocoding failed');
              }
              
              const data = await response.json();
              const address = data.address || {};
              const city = address.city || address.town || address.village || 'Unknown Location';
              const state = address.state || '';
              const country = address.country || '';
              
              resolve({
                city,
                state,
                country,
                coordinates: {
                  lat: position.coords.latitude.toFixed(4),
                  lon: position.coords.longitude.toFixed(4)
                },
                source: 'geolocation',
                accuracy: position.coords.accuracy
              });
            } catch (error) {
              resolve({
                city: 'Unknown Location',
                coordinates: {
                  lat: position.coords.latitude.toFixed(4),
                  lon: position.coords.longitude.toFixed(4)
                },
                source: 'geolocation',
                accuracy: position.coords.accuracy
              });
            }
          },
          (error) => {
            let errorMessage = 'Failed to get location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
              default:
                errorMessage = 'Unknown location error';
                break;
            }
            
            reject(new Error(errorMessage));
          },
          options
        );
      });
      
      if (location && location.source === 'geolocation') {
        setUserLocation(location);
        
        // Fetch weather for the new location
        const data = await weatherAPI.getRealTimeWeather(location.city);
        setRealTimeWeather(data);
        
        toast.success(`Location enabled! Now showing weather for ${location.city}`, { id: 'location-request' });
      } else {
        toast.error('Location access denied or unavailable. Using default location.', { id: 'location-request' });
      }
    } catch (error) {
      console.error('Location request failed:', error);
      
      if (error.message.includes('denied')) {
        setLocationDenied(true);
        toast.error(
          'Location permission denied. To enable: Click the location icon in your browser\'s address bar and select "Allow".',
          { 
            id: 'location-request',
            duration: 8000
          }
        );
      } else {
        toast.error(`Location request failed: ${error.message}`, { id: 'location-request' });
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Use real-time data if available, otherwise fall back to mock data
  const weatherMetrics = realTimeWeather ? {
    temperature: { 
      current: parseFloat(realTimeWeather.current.temp_c).toFixed(3), 
      min: parseFloat(realTimeWeather.current.temp_c - 5).toFixed(3), 
      max: parseFloat(realTimeWeather.current.temp_c + 5).toFixed(3), 
      unit: '°C' 
    },
    humidity: { current: parseFloat(realTimeWeather.current.humidity).toFixed(3), unit: '%' },
    precipitation: { current: parseFloat(realTimeWeather.current.precip_mm).toFixed(3), unit: 'mm' },
    windSpeed: { current: parseFloat(realTimeWeather.current.wind_kph).toFixed(3), unit: 'km/h' },
    visibility: { current: parseFloat(realTimeWeather.current.vis_km).toFixed(3), unit: 'km' }
  } : {
    temperature: { current: (22.000).toFixed(3), min: (18.000).toFixed(3), max: (26.000).toFixed(3), unit: '°C' },
    humidity: { current: (65.000).toFixed(3), unit: '%' },
    precipitation: { current: (0.200).toFixed(3), unit: 'mm' },
    windSpeed: { current: (12.000).toFixed(3), unit: 'km/h' },
    visibility: { current: (10.000).toFixed(3), unit: 'km' }
  };

  const pipelineStatus = {
    dataIngestion: 'active',
    dataProcessing: 'active',
    mlModel: 'active',
    storage: 'active'
  };

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'High temperature anomaly detected in Amaravati', time: '2 min ago' },
    { id: 2, type: 'info', message: 'Data pipeline processing completed successfully', time: '5 min ago' },
    { id: 3, type: 'success', message: 'ML model prediction accuracy improved to 89.2%', time: '1 hour ago' }
  ];

  const weatherData = [
    { time: '00:00', temperature: 18, humidity: 70, precipitation: 0 },
    { time: '04:00', temperature: 16, humidity: 75, precipitation: 0.5 },
    { time: '08:00', temperature: 19, humidity: 68, precipitation: 0.2 },
    { time: '12:00', temperature: 24, humidity: 60, precipitation: 0 },
    { time: '16:00', temperature: 26, humidity: 55, precipitation: 0 },
    { time: '20:00', temperature: 22, humidity: 65, precipitation: 0.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Weather Data Pipeline Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Real-time weather monitoring and analysis powered by AWS
          </p>
        </div>
        <div className="mt-4 flex space-x-2 md:ml-4 md:mt-0">
          <button className="btn-primary">
            <Cloud className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          {realTimeWeather && (
            <div className={`flex items-center text-sm px-3 py-2 rounded-lg ${
              userLocation && userLocation.city === realTimeWeather.location.name 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-orange-600 bg-orange-50'
            }`}>
              <Radio className="h-4 w-4 mr-1" />
              Live Data: {realTimeWeather.location.name}
              {userLocation && userLocation.city === realTimeWeather.location.name ? (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  🎯 Your Location
                </span>
              ) : (
                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                  📍 Default Location
                </span>
              )}
            </div>
          )}
          {!userLocation && (
            <button
              onClick={handleEnableLocation}
              disabled={locationLoading}
              className="flex items-center text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Click to enable location access and get personalized weather for your area"
            >
              {locationLoading ? (
                <>
                  <Navigation className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>📍 Enable location for personalized weather</span>
                </>
              )}
            </button>
          )}
          
          {userLocation && (
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <Navigation className="h-4 w-4 mr-2" />
              <span>✅ Location enabled: {userLocation.city}</span>
            </div>
          )}
          <LocationPermission 
            onLocationUpdate={setUserLocation}
            showAsCard={false}
          />
        </div>
      </div>

      {/* Location Permission Help */}
      {locationDenied && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Location Permission Required
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                To show weather for your location, please enable location access in your browser:
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Chrome/Edge:</span>
                  <span>Click the 🔒 or 📍 icon in the address bar → Location → Allow</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Firefox:</span>
                  <span>Click the 🛡️ shield icon → Permissions → Location → Allow</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Safari:</span>
                  <span>Safari menu → Settings → Websites → Location → Allow</span>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setLocationDenied(false);
                    handleEnableLocation();
                  }}
                  className="btn-secondary text-sm px-3 py-1"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setLocationDenied(false)}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Pipeline Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusIndicator 
            name="Data Ingestion" 
            status={pipelineStatus.dataIngestion}
            icon={Cloud}
          />
          <StatusIndicator 
            name="Data Processing" 
            status={pipelineStatus.dataProcessing}
            icon={TrendingUp}
          />
          <StatusIndicator 
            name="ML Model" 
            status={pipelineStatus.mlModel}
            icon={Eye}
          />
          <StatusIndicator 
            name="Storage" 
            status={pipelineStatus.storage}
            icon={Cloud}
          />
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
        <MetricCard
          title="Temperature"
          value={`${weatherMetrics.temperature.current}${weatherMetrics.temperature.unit}`}
          subtitle={`${weatherMetrics.temperature.min}° - ${weatherMetrics.temperature.max}°`}
          icon={Thermometer}
          color="weather.hot"
          trend="+2.3%"
        />
        <MetricCard
          title="Humidity"
          value={`${weatherMetrics.humidity.current}${weatherMetrics.humidity.unit}`}
          subtitle="Normal range"
          icon={Droplets}
          color="weather.cool"
          trend="-1.2%"
        />
        <MetricCard
          title="Precipitation"
          value={`${weatherMetrics.precipitation.current}${weatherMetrics.precipitation.unit}`}
          subtitle="Light rain"
          icon={Droplets}
          color="weather.cool"
          trend="+0.5%"
        />
        <MetricCard
          title="Wind Speed"
          value={`${weatherMetrics.windSpeed.current}${weatherMetrics.windSpeed.unit}`}
          subtitle="Gentle breeze"
          icon={Wind}
          color="weather.mild"
          trend="+0.8%"
        />
        <MetricCard
          title="Visibility"
          value={`${weatherMetrics.visibility.current}${weatherMetrics.visibility.unit}`}
          subtitle="Excellent"
          icon={Eye}
          color="weather.mild"
          trend="+0.1%"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">24-Hour Weather Trends</h3>
            <WeatherChart data={weatherData} />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  {alert.type === 'info' && <Eye className="h-5 w-5 text-blue-500" />}
                  {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <Cloud className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Generate Weather Report</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Run ML Prediction</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <Eye className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
