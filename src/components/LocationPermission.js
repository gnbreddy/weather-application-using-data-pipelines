import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  AlertCircle, 
  CheckCircle, 
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUserLocation, checkLocationPermission, clearLocationCache } from '../services/geolocation';

const LocationPermission = ({ onLocationUpdate, showAsCard = true }) => {
  const [, setPermissionState] = useState('unknown');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPermissionCard, setShowPermissionCard] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
    loadCachedLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkPermissionStatus = async () => {
    const permission = await checkLocationPermission();
    setPermissionState(permission);
    
    if (permission === 'granted') {
      // Auto-load location if permission is already granted
      handleGetLocation(false); // Don't show toasts for auto-load
    } else if (permission === 'prompt' || permission === 'unknown') {
      setShowPermissionCard(true);
    }
  };

  const loadCachedLocation = () => {
    // Try to get cached location without making new request
    const cached = localStorage.getItem('weather_app_last_location');
    if (cached) {
      try {
        const location = JSON.parse(cached);
        setCurrentLocation(location);
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      } catch (error) {
        console.error('Failed to parse cached location:', error);
      }
    }
  };

  const handleGetLocation = async (showToasts = true) => {
    setLoading(true);
    
    try {
      const location = await getUserLocation(showToasts);
      setCurrentLocation(location);
      setPermissionState('granted');
      setShowPermissionCard(false);
      
      // Cache location in localStorage as backup
      localStorage.setItem('weather_app_last_location', JSON.stringify(location));
      
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
      
      if (showToasts && location.source !== 'fallback') {
        toast.success(`Location updated: ${location.city}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      if (showToasts) {
        toast.error('Failed to get location');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDenyLocation = () => {
    setShowPermissionCard(false);
    setPermissionState('denied');
    toast.info('Using default location. You can enable location access anytime.');
  };

  const handleClearCache = () => {
    clearLocationCache();
    localStorage.removeItem('weather_app_last_location');
    setCurrentLocation(null);
    if (onLocationUpdate) {
      onLocationUpdate(null);
    }
  };

  // Permission request card
  const PermissionCard = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <Navigation className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Enable Location Access
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Allow us to access your location to show personalized weather data for your area. 
          Your location data is only used for weather services and is stored locally.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleGetLocation(true)}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Allow Location Access
              </>
            )}
          </button>
          
          <button
            onClick={handleDenyLocation}
            className="w-full btn-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4 mr-2" />
            Use Default Location
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Privacy Notice:</p>
              <p>Your location is processed locally and cached for 30 minutes. We don't store or share your location data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Location status component
  const LocationStatus = () => {
    if (!showAsCard && !currentLocation) return null;

    return (
      <div className={showAsCard ? "card" : "inline-flex items-center space-x-2"}>
        {showAsCard && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Location</h3>
        )}
        
        <div className={showAsCard ? "space-y-4" : "flex items-center space-x-2"}>
          {currentLocation ? (
            <div className={showAsCard ? "flex items-center justify-between" : "flex items-center space-x-2"}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100 mr-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentLocation.city}</p>
                  <p className="text-sm text-gray-500">
                    {currentLocation.state && `${currentLocation.state}, `}{currentLocation.country}
                  </p>
                  {showAsCard && currentLocation.coordinates && (
                    <p className="text-xs text-gray-400">
                      {currentLocation.coordinates.lat}, {currentLocation.coordinates.lon}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleGetLocation(true)}
                  disabled={loading}
                  className="btn-secondary text-sm px-2 py-1"
                  title="Refresh location"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                {showAsCard && (
                  <button
                    onClick={handleClearCache}
                    className="btn-secondary text-sm px-2 py-1"
                    title="Clear location cache"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gray-100 mr-3">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Location not available</p>
                <button
                  onClick={() => handleGetLocation(true)}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {loading ? 'Getting location...' : 'Enable location access'}
                </button>
              </div>
            </div>
          )}
        </div>

        {showAsCard && currentLocation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Source:</span>
                <p className="font-medium capitalize">{currentLocation.source || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-gray-500">Accuracy:</span>
                <p className="font-medium">
                  {currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {showPermissionCard && <PermissionCard />}
      <LocationStatus />
    </>
  );
};

export default LocationPermission;