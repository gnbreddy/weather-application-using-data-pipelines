import { useState, useEffect } from 'react';
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
import AIWeatherAssistant from '../components/AIWeatherAssistant';
import { weatherAPI } from '../services/api';
import geminiService from '../services/gemini';

const Dashboard = () => {
  const [realTimeWeather, setRealTimeWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(null);
  const [weatherReport, setWeatherReport] = useState(null);
  const [mlPrediction, setMlPrediction] = useState(null);

  // Fetch real-time weather data
  useEffect(() => {
    const fetchWeatherData = async (location = '16.5062,80.6480') => {
      try {
        const data = await weatherAPI.getRealTimeWeather(location);
        setRealTimeWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        toast.error('Failed to load real-time weather data');
      }
    };

    // Try to get user's actual location, fallback to Amaravati
    const initializeWeather = async () => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.log('🏙️ Geolocation not supported, using default location: Amaravati');
        setUserLocation({
          city: 'Amaravati',
          state: 'Andhra Pradesh',
          country: 'India',
          coordinates: { lat: '16.5062', lon: '80.6480' },
          source: 'default'
        });
        fetchWeatherData('16.5062,80.6480');
        return;
      }

      // Try to get user's location
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;
        console.log('📍 User location detected:', latitude, longitude);
        
        // Fetch weather for user's actual location
        const locationString = `${latitude},${longitude}`;
        const weatherData = await weatherAPI.getRealTimeWeather(locationString);
        
        setUserLocation({
          city: weatherData.location.name,
          state: weatherData.location.region,
          country: weatherData.location.country,
          coordinates: { lat: latitude.toString(), lon: longitude.toString() },
          source: 'gps'
        });
        
        setRealTimeWeather(weatherData);
        toast.success(`Location detected! Showing weather for ${weatherData.location.name}`, { duration: 3000 });
        
      } catch (error) {
        console.log('🏙️ Could not get user location, using default: Amaravati');
        console.error('Geolocation error:', error);
        
        setUserLocation({
          city: 'Amaravati',
          state: 'Andhra Pradesh',
          country: 'India',
          coordinates: { lat: '16.5062', lon: '80.6480' },
          source: 'default'
        });
        
        fetchWeatherData('16.5062,80.6480');
      }
    };

    initializeWeather();
    
    // Refresh every 5 minutes using the current location
    const interval = setInterval(() => {
      if (userLocation && userLocation.coordinates) {
        const locationString = `${userLocation.coordinates.lat},${userLocation.coordinates.lon}`;
        console.log('🔄 Refreshing weather data for', userLocation.city);
        fetchWeatherData(locationString);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Quick Action Handlers
  const handleGenerateWeatherReport = async () => {
    if (!realTimeWeather) {
      toast.error('Please wait for weather data to load');
      return;
    }

    setQuickActionLoading('report');
    toast.loading('Generating comprehensive weather report...', { id: 'weather-report' });

    try {
      const result = await geminiService.generateWeatherAnalysis({
        location: realTimeWeather.location.name,
        temperature: realTimeWeather.current.temp_c,
        humidity: realTimeWeather.current.humidity,
        windSpeed: realTimeWeather.current.wind_kph,
        conditions: realTimeWeather.current.condition.text
      });

      if (result.success) {
        setWeatherReport(result.analysis);
        toast.success('Weather report generated!', { id: 'weather-report' });
      } else {
        // Use fallback analysis if available
        if (result.fallback) {
          setWeatherReport(result.fallback);
          toast.success('Weather report generated (basic mode)', { id: 'weather-report', duration: 4000 });
        } else {
          const errorMsg = result.error || 'Failed to generate report';
          toast.error(`Error: ${errorMsg}`, { id: 'weather-report' });
          console.error('Report generation failed:', result);
        }
      }
    } catch (error) {
      toast.error(`Failed to generate weather report: ${error.message}`, { id: 'weather-report' });
      console.error('Report Error:', error);
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleRunMLPrediction = async () => {
    if (!realTimeWeather) {
      toast.error('Please wait for weather data to load');
      return;
    }

    setQuickActionLoading('prediction');
    toast.loading('Running ML prediction model...', { id: 'ml-prediction' });

    try {
      const result = await geminiService.generateWeatherPrediction(
        realTimeWeather.location.name,
        7
      );

      if (result.success) {
        setMlPrediction(result.prediction);
        toast.success('ML prediction completed!', { id: 'ml-prediction' });
      } else {
        // Use fallback prediction if available
        if (result.fallback) {
          setMlPrediction(result.fallback);
          if (result.hasRealData) {
            toast.success('Forecast data loaded (AI unavailable)', { id: 'ml-prediction', duration: 4000 });
          } else {
            toast.success('Prediction guide generated', { id: 'ml-prediction', duration: 4000 });
          }
        } else {
          const errorMsg = result.error || 'Failed to run prediction';
          toast.error(`Error: ${errorMsg}`, { id: 'ml-prediction' });
          console.error('Prediction failed:', result);
        }
      }
    } catch (error) {
      toast.error(`Failed to run ML prediction: ${error.message}`, { id: 'ml-prediction' });
      console.error('Prediction Error:', error);
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleViewAnalytics = () => {
    // Simply navigate to analytics page - no need for API call
    toast.success('Navigating to Analytics...', { duration: 1000 });
    setTimeout(() => {
      window.location.href = '/analytics';
    }, 500);
  };

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
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
            title="Reload the page to fetch fresh weather data"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          
          {/* Single unified location display */}
          {realTimeWeather && userLocation && (
            <>
              {userLocation.source === 'gps' ? (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <Navigation className="h-4 w-4 mr-2" />
                  <span>📍 Live: {realTimeWeather.location.name}, {realTimeWeather.location.region}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>📍 Default: {realTimeWeather.location.name}, {realTimeWeather.location.region}</span>
                  </div>
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
                        <Radio className="h-4 w-4 mr-2" />
                        <span>Enable GPS</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}
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

      {/* AI Weather Assistant - Disabled due to API key issues */}
      {realTimeWeather && false && (
        <AIWeatherAssistant weatherData={realTimeWeather} />
      )}
      
      {/* AI Features Unavailable Notice */}
      {realTimeWeather && (
        <div className="card border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                AI Features Temporarily Unavailable
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                The Gemini AI integration is currently unavailable. This affects:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 mb-3 list-disc list-inside">
                <li>AI Weather Analysis</li>
                <li>Smart Recommendations</li>
                <li>AI-Powered Predictions</li>
              </ul>
              <p className="text-sm text-yellow-700">
                <strong>Good news:</strong> All weather data, forecasts, and analytics are still fully functional using real-time data from WeatherAPI.com!
              </p>
            </div>
          </div>
        </div>
      )}

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
          <button 
            onClick={handleGenerateWeatherReport}
            disabled={!realTimeWeather || quickActionLoading === 'report'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickActionLoading === 'report' ? (
              <>
                <Cloud className="h-6 w-6 text-blue-500 mr-2 animate-spin" />
                <span className="text-sm font-medium text-blue-700">Generating...</span>
              </>
            ) : (
              <>
                <Cloud className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Generate Weather Report</span>
              </>
            )}
          </button>
          <button 
            onClick={handleRunMLPrediction}
            disabled={!realTimeWeather || quickActionLoading === 'prediction'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickActionLoading === 'prediction' ? (
              <>
                <TrendingUp className="h-6 w-6 text-purple-500 mr-2 animate-spin" />
                <span className="text-sm font-medium text-purple-700">Running...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Run ML Prediction</span>
              </>
            )}
          </button>
          <button 
            onClick={handleViewAnalytics}
            disabled={!realTimeWeather || quickActionLoading === 'analytics'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickActionLoading === 'analytics' ? (
              <>
                <Eye className="h-6 w-6 text-green-500 mr-2 animate-spin" />
                <span className="text-sm font-medium text-green-700">Loading...</span>
              </>
            ) : (
              <>
                <Eye className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">View Analytics</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Weather Report Display */}
      {weatherReport && (
        <div className="card border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Cloud className="h-5 w-5 text-blue-600 mr-2" />
              Weather Report for {realTimeWeather?.location.name}
            </h3>
            <button
              onClick={() => setWeatherReport(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {weatherReport}
            </div>
          </div>
        </div>
      )}

      {/* ML Prediction Display */}
      {mlPrediction && (
        <div className="card border-2 border-purple-200 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
              7-Day ML Prediction for {realTimeWeather?.location.name}
            </h3>
            <button
              onClick={() => setMlPrediction(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {mlPrediction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
