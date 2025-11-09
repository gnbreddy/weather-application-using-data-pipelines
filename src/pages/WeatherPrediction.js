import React, { useState } from 'react';
import { Cloud, MapPin, Thermometer, Droplets, Wind, Eye, Zap, Search, Sparkles, Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from 'react-query';
import { weatherAPI } from '../services/api';
import geminiService from '../services/gemini';
import { INDIAN_CITIES, INDIAN_STATES, CITIES_BY_STATE } from '../data/indianCities';

const WeatherPrediction = () => {
  const [formData, setFormData] = useState({
    locationCategory: 'CITY',
    locationName: '',
    startDate: '',
    duration: '7',
    selectedCity: 'Amaravati',
    selectedState: 'Andhra Pradesh',
    liveWeatherDate: new Date().toISOString().split('T')[0],
  });
  const [predictions, setPredictions] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState(INDIAN_CITIES);
  const [loadingLiveWeather, setLoadingLiveWeather] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const locationCategories = [
    'CITY', 'AIRPORT', 'RESEARCH_STATION', 'WEATHER_STATION', 'MARINE_STATION'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update filtered cities when state changes
    if (name === 'selectedState') {
      const citiesInState = CITIES_BY_STATE[value] || [];
      setFilteredCities(citiesInState);
      if (citiesInState.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedCity: citiesInState[0].name
        }));
      }
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredCities(INDIAN_CITIES);
    } else {
      const filtered = INDIAN_CITIES.filter(city => 
        city.name.toLowerCase().includes(term) || 
        city.state.toLowerCase().includes(term)
      );
      setFilteredCities(filtered);
    }
  };

  const handleLiveWeatherFetch = async () => {
    const { selectedCity } = formData;
    setLoadingLiveWeather(true);
    setAiAnalysis(null);
    
    try {
      toast.loading(`Fetching real-time weather for ${selectedCity}...`, { id: 'live-weather' });
      
      // Use WeatherAPI.com to get real-time weather data
      const data = await weatherAPI.getRealTimeWeather(selectedCity);
      
      setLiveWeather(data);
      toast.success(`Live weather for ${selectedCity} updated!`, { id: 'live-weather' });
      
      // Automatically generate AI analysis for the weather data
      handleGenerateAIAnalysis(data);
      
    } catch (error) {
      toast.error('Failed to fetch live weather data', { id: 'live-weather' });
      console.error('Live Weather Error:', error);
    } finally {
      setLoadingLiveWeather(false);
    }
  };

  const handleGenerateAIAnalysis = async (weatherData) => {
    setLoadingAI(true);
    
    try {
      toast.loading('Generating AI analysis...', { id: 'ai-analysis' });
      
      const result = await geminiService.generateWeatherAnalysis({
        location: weatherData.location.name,
        temperature: weatherData.current.temp_c,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.wind_kph,
        conditions: weatherData.current.condition.text
      });
      
      if (result.success) {
        setAiAnalysis(result.analysis);
        toast.success('AI analysis ready!', { id: 'ai-analysis' });
      } else {
        toast.dismiss('ai-analysis');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.dismiss('ai-analysis');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerateAIPrediction = async () => {
    if (!formData.selectedCity) {
      toast.error('Please select a city first');
      return;
    }

    setLoadingAI(true);
    setAiPrediction(null);
    
    try {
      toast.loading(`Generating AI prediction for ${formData.selectedCity}...`, { id: 'ai-prediction' });
      
      // First get current weather data
      const weatherData = await weatherAPI.getRealTimeWeather(formData.selectedCity);
      
      // Then get AI prediction
      const result = await geminiService.generateWeatherPrediction(
        formData.selectedCity,
        parseInt(formData.duration)
      );
      
      if (result.success) {
        setAiPrediction({
          ...result,
          currentWeather: weatherData
        });
        toast.success('AI prediction generated!', { id: 'ai-prediction' });
      } else {
        toast.error(result.error || 'Failed to generate prediction', { id: 'ai-prediction' });
      }
    } catch (error) {
      toast.error('Failed to generate AI prediction', { id: 'ai-prediction' });
      console.error('AI Prediction Error:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const mutation = useMutation(
    ({ locationCategory, locationName, startDate, duration }) =>
      weatherAPI.getWeatherPrediction(locationCategory, locationName, startDate, duration),
    {
      onSuccess: (data) => {
        setPredictions(data.data);
        toast.success('Weather predictions generated successfully!');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to generate predictions. Please try again.';
        const errorDetails = error.response?.data?.details;
        
        toast.error(errorMessage);
        if (errorDetails) {
          console.error('Prediction Error Details:', errorDetails);
        }
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure duration is a number before sending
    const dataToSend = {
      ...formData,
      duration: Number(formData.duration)
    };
    mutation.mutate(dataToSend);
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 30) return 'text-red-600';
    if (temp >= 25) return 'text-orange-600';
    if (temp >= 20) return 'text-yellow-600';
    if (temp >= 15) return 'text-green-600';
    if (temp >= 10) return 'text-blue-600';
    return 'text-purple-600';
  };

  const getWeatherIcon = (tmax, prcp) => {
    if (prcp > 0.5) return '🌧️';
    if (tmax > 25) return '☀️';
    if (tmax > 20) return '⛅';
    return '🌤️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Weather Prediction & Live Data
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate weather forecasts or get live weather for a specific date.
          </p>
        </div>
      </div>

      {/* Live Weather Form */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Get Real-Time Weather</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select from {INDIAN_CITIES.length}+ cities across India to get live weather data
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search City
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by city or state name..."
              className="input-field"
            />
          </div>
          
          {/* State Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              name="selectedState"
              value={formData.selectedState}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          {/* City Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City ({filteredCities.length} cities)
            </label>
            <select
              name="selectedCity"
              value={formData.selectedCity}
              onChange={handleInputChange}
              className="input-field"
            >
              {filteredCities.map(city => (
                <option key={`${city.name}-${city.state}`} value={city.name}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>
          
          {/* Fetch Button */}
          <div className="flex items-end">
            <button
              onClick={handleLiveWeatherFetch}
              disabled={loadingLiveWeather}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingLiveWeather ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Get Live Weather
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Weather Display */}
      {liveWeather && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Real-Time Weather for {liveWeather.location.name}
              </h3>
              <p className="text-sm text-gray-500">
                {liveWeather.location.region}, {liveWeather.location.country}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">{liveWeather.current.last_updated}</p>
            </div>
          </div>

          {/* Current Weather Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Thermometer className="h-8 w-8 text-red-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{liveWeather.current.temp_c}°C</p>
                  <p className="text-xs text-red-800">Temperature</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">Feels like: {liveWeather.current.feelslike_c}°C</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Droplets className="h-8 w-8 text-blue-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{liveWeather.current.humidity}%</p>
                  <p className="text-xs text-blue-800">Humidity</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">Precipitation: {liveWeather.current.precip_mm}mm</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Wind className="h-8 w-8 text-green-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{liveWeather.current.wind_kph}</p>
                  <p className="text-xs text-green-800">Wind (km/h)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">Direction: {liveWeather.current.wind_dir}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{liveWeather.current.vis_km}</p>
                  <p className="text-xs text-purple-800">Visibility (km)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">UV Index: {liveWeather.current.uv}</p>
            </div>
          </div>

          {/* Detailed Weather Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detailed Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Condition</p>
                <p className="font-medium text-gray-900">{liveWeather.current.condition.text}</p>
              </div>
              <div>
                <p className="text-gray-500">Pressure</p>
                <p className="font-medium text-gray-900">{liveWeather.current.pressure_mb} mb</p>
              </div>
              <div>
                <p className="text-gray-500">Cloud Cover</p>
                <p className="font-medium text-gray-900">{liveWeather.current.cloud}%</p>
              </div>
              <div>
                <p className="text-gray-500">Gust Speed</p>
                <p className="font-medium text-gray-900">{liveWeather.current.gust_kph} km/h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Display */}
      {aiAnalysis && (
        <div className="card border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">AI Weather Analysis</h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                Powered by Gemini AI
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          </div>
        </div>
      )}

      {/* AI Prediction Section */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">AI-Powered Weather Prediction</h3>
          </div>
          <button
            onClick={handleGenerateAIPrediction}
            disabled={loadingAI || !formData.selectedCity}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAI ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
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
        
        <p className="text-sm text-gray-600 mb-4">
          Get intelligent weather predictions powered by Google's Gemini AI for {formData.selectedCity}
        </p>

        {aiPrediction && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                AI Forecast for {formData.duration} Days
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {aiPrediction.prediction}
              </div>
            </div>
            
            {aiPrediction.currentWeather && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Current Conditions:</strong> {aiPrediction.currentWeather.current.temp_c}°C, 
                  {aiPrediction.currentWeather.current.condition.text}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prediction Form */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Parameters</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Category
              </label>
              <select
                name="locationCategory"
                value={formData.locationCategory}
                onChange={handleInputChange}
                className="input-field"
              >
                {locationCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name
              </label>
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, New York"
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="input-field"
                required
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isLoading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Generating Predictions...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Predictions Results */}
      {predictions && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Predictions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weather
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precipitation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Snow
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map((prediction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {prediction.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getWeatherIcon(prediction.tmax, prediction.prcp)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {prediction.prcp > 0.5 ? 'Rainy' : prediction.tmax > 25 ? 'Sunny' : 'Partly Cloudy'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-red-500 mr-1" />
                        <span className={`font-medium ${getTemperatureColor(prediction.tmax)}`}>
                          {prediction.tmax}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-blue-500 mr-1" />
                        <span className={`font-medium ${getTemperatureColor(prediction.tmin)}`}>
                          {prediction.tmin}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-gray-900">{prediction.prcp}mm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-900">{prediction.snow}cm</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">89.2%</div>
            <div className="text-sm text-blue-800">Prediction Accuracy</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">XGBoost</div>
            <div className="text-sm text-green-800">ML Algorithm</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">13 Years</div>
            <div className="text-sm text-purple-800">Training Data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPrediction;
