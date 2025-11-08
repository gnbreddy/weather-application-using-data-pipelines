import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Calendar, Thermometer, Droplets, Wind, Eye, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from 'react-query';
import { weatherAPI } from '../services/api';

const CITIES = {
  HYDERABAD: { lat: 17.3850, lon: 78.4867 },
  VIJAYAWADA: { lat: 16.5062, lon: 80.6480 },
};

const WeatherPrediction = () => {
  const [formData, setFormData] = useState({
    locationCategory: 'CITY',
    locationName: '',
    startDate: '',
    duration: '7',
    selectedCity: 'HYDERABAD',
    liveWeatherDate: new Date().toISOString().split('T')[0],
  });
  const [predictions, setPredictions] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);

  const locationCategories = [
    'CITY', 'AIRPORT', 'RESEARCH_STATION', 'WEATHER_STATION', 'MARINE_STATION'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLiveWeatherFetch = async () => {
    const { selectedCity, liveWeatherDate } = formData;
    const city = CITIES[selectedCity];
    try {
      const data = await weatherAPI.getLiveWeather(city.lat, city.lon, liveWeatherDate);
      setLiveWeather(data.daily);
      toast.success(`Live weather for ${selectedCity} on ${liveWeatherDate} updated!`);
    } catch (error) {
      toast.error('Failed to fetch live weather data');
      console.error('Live Weather Error:', error);
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Get Live Weather</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              name="selectedCity"
              value={formData.selectedCity}
              onChange={handleInputChange}
              className="input-field"
            >
              {Object.keys(CITIES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="liveWeatherDate"
              value={formData.liveWeatherDate}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLiveWeatherFetch}
              className="btn-primary w-full"
            >
              Get Live Weather
            </button>
          </div>
        </div>
      </div>

      {/* Live Weather Display */}
      {liveWeather && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Live Weather for {formData.selectedCity} on {new Date(formData.liveWeatherDate).toLocaleDateString()}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precipitation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liveWeather.time.map((date, index) => (
                  <tr key={date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-red-500 mr-1" />
                        <span className={`font-medium ${getTemperatureColor(liveWeather.temperature_2m_max[index])}`}>
                          {liveWeather.temperature_2m_max[index]}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-blue-500 mr-1" />
                        <span className={`font-medium ${getTemperatureColor(liveWeather.temperature_2m_min[index])}`}>
                          {liveWeather.temperature_2m_min[index]}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-gray-900">{liveWeather.precipitation_sum?.[index] || 0}mm</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
