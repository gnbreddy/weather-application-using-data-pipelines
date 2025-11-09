import React, { useState, useEffect } from 'react';
import { MapPin, Search, Globe, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RealTimeWeather from '../components/RealTimeWeather';
import LocationPermission from '../components/LocationPermission';
import { getUserLocation } from '../services/geolocation';

const RealTimeWeatherPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Automatically get user location on page load
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation(true);
        if (location && location.source !== 'fallback') {
          setUserLocation(location);
          // Use coordinates for accurate weather
          const coords = `${location.coordinates.lat},${location.coordinates.lon}`;
          setSelectedLocation(coords);
          setIsUsingUserLocation(true);
          console.log('✅ Using your live location:', location.city, location.state);
        } else {
          // Fallback to Amaravati, Andhra Pradesh
          setSelectedLocation('16.5062,80.6480');
          console.log('⚠️ Using fallback: Amaravati, Andhra Pradesh');
        }
      } catch (error) {
        console.error('Location error:', error);
        setSelectedLocation('16.5062,80.6480');
        toast.error('Could not get your location. Using Amaravati, Andhra Pradesh');
      } finally {
        setLocationLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const popularLocations = [
    // Indian Cities (Prioritized)
    'Mumbai',
    'Delhi', 
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Kochi',
    'Lucknow',
    'Indore',
    'Bhopal',
    'Chandigarh',
    'Guwahati',
    // International Cities
    'Singapore',
    'Dubai',
    'Bangkok',
    'London',
    'New York',
    'San Francisco',
    'Tokyo',
    'Sydney',
    'Paris'
  ];

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setIsUsingUserLocation(false);
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      setSelectedLocation(customLocation.trim());
      setCustomLocation('');
      setIsUsingUserLocation(false);
    }
  };

  const handleUserLocationUpdate = (location) => {
    if (location) {
      setUserLocation(location);
      // Use coordinates for accurate weather
      const coords = `${location.coordinates.lat},${location.coordinates.lon}`;
      setSelectedLocation(coords);
      setIsUsingUserLocation(true);
      console.log('✅ Location updated:', location.city, location.state);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      // Use coordinates for accurate weather
      const coords = `${userLocation.coordinates.lat},${userLocation.coordinates.lon}`;
      setSelectedLocation(coords);
      setIsUsingUserLocation(true);
      toast.success(`Using your location: ${userLocation.city}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Real-Time Weather Data
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Live weather conditions powered by WeatherAPI.com
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <Globe className="h-4 w-4 mr-1" />
            API: WeatherAPI.com
          </div>
        </div>
      </div>

      {/* User Location */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Current Location</h3>
        <LocationPermission 
          onLocationUpdate={handleUserLocationUpdate}
          showAsCard={false}
        />
        
        {userLocation && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  <strong>Your location:</strong> {userLocation.city}
                  {userLocation.state && `, ${userLocation.state}`}
                </span>
              </div>
              <button
                onClick={handleUseCurrentLocation}
                className={`btn-secondary text-sm px-3 py-1 ${
                  isUsingUserLocation ? 'bg-green-100 text-green-700' : ''
                }`}
              >
                {isUsingUserLocation ? 'Currently Using' : 'Use This Location'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Selector */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Location</h3>
        
        {/* Custom Location Input */}
        <form onSubmit={handleCustomLocationSubmit} className="mb-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter city name, coordinates, or postal code..."
                className="input-field"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </form>

        {/* Indian Cities (Priority) */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">🇮🇳 Indian Cities:</p>
          <div className="flex flex-wrap gap-2">
            {popularLocations.slice(0, 15).map((location) => (
              <button
                key={location}
                onClick={() => handleLocationChange(location)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedLocation === location
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                <MapPin className="h-3 w-3 inline mr-1" />
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* International Cities */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">🌍 International Cities:</p>
          <div className="flex flex-wrap gap-2">
            {popularLocations.slice(15).map((location) => (
              <button
                key={location}
                onClick={() => handleLocationChange(location)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedLocation === location
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <MapPin className="h-3 w-3 inline mr-1" />
                {location}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                <strong>Currently showing:</strong> {
                  locationLoading ? 'Loading your location...' :
                  isUsingUserLocation && userLocation ? 
                    `${userLocation.city}${userLocation.state ? ', ' + userLocation.state : ''}${userLocation.country ? ', ' + userLocation.country : ''}` :
                    selectedLocation
                }
                {isUsingUserLocation && !locationLoading && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <Navigation className="h-3 w-3 mr-1" />
                    Your Live Location
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {isUsingUserLocation ? 
                  'Showing weather for your actual location' :
                  'You can search by city name, coordinates (lat,lon), postal code, or use your current location'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Weather Component */}
      <RealTimeWeather location={selectedLocation} key={selectedLocation} />

      {/* API Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Real-Time</div>
            <div className="text-sm text-green-800">Data Updates</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">WeatherAPI.com</div>
            <div className="text-sm text-blue-800">Data Source</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">Global</div>
            <div className="text-sm text-purple-800">Coverage</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Available Data Points:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
            <div>• Temperature (°C/°F)</div>
            <div>• Feels Like Temperature</div>
            <div>• Humidity (%)</div>
            <div>• Wind Speed & Direction</div>
            <div>• Atmospheric Pressure</div>
            <div>• Visibility</div>
            <div>• UV Index</div>
            <div>• Cloud Cover</div>
            <div>• Precipitation</div>
            <div>• Air Quality Index</div>
            <div>• Weather Condition</div>
            <div>• Local Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeWeatherPage;