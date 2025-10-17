// Geolocation service for getting user's current location
import { toast } from 'react-hot-toast';

const GEOLOCATION_COOKIE_KEY = 'weather_app_location';
const LOCATION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Track if we've already shown the cached location toast to prevent infinite notifications
let hasShownCachedToast = false;
let lastCachedLocationCity = null;

// Cookie utilities
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Reverse geocoding to get city name from coordinates
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    // Extract city name from the response
    const address = data.address || {};
    const city = address.city || 
                 address.town || 
                 address.village || 
                 address.municipality || 
                 address.county || 
                 address.state_district ||
                 'Unknown Location';
    
    const state = address.state || address.region || '';
    const country = address.country || '';
    
    return {
      city,
      state,
      country,
      fullAddress: data.display_name || `${city}, ${state}, ${country}`,
      coordinates: {
        lat: parseFloat(lat).toFixed(4),
        lon: parseFloat(lon).toFixed(4)
      }
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Unknown Location',
      state: '',
      country: '',
      fullAddress: `${lat}, ${lon}`,
      coordinates: {
        lat: parseFloat(lat).toFixed(4),
        lon: parseFloat(lon).toFixed(4)
      }
    };
  }
};

// Check if geolocation is supported
const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

// Get cached location from cookies
const getCachedLocation = () => {
  const cached = getCookie(GEOLOCATION_COOKIE_KEY);
  
  if (cached && cached.timestamp) {
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    
    // Return cached location if it's less than 30 minutes old
    if (cacheAge < LOCATION_CACHE_DURATION) {
      return cached.location;
    } else {
      // Cache expired, delete it
      deleteCookie(GEOLOCATION_COOKIE_KEY);
    }
  }
  
  return null;
};

// Cache location in cookies
const cacheLocation = (location) => {
  const locationData = {
    location,
    timestamp: Date.now()
  };
  setCookie(GEOLOCATION_COOKIE_KEY, locationData, 7); // Cache for 7 days
};

// Get user's current position using browser geolocation API
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 5 * 60 * 1000 // Accept cached position up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
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
};

// Main function to get user location with caching
export const getUserLocation = async (showToasts = true) => {
  try {
    // First, check for cached location
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      // Only show cached toast once per session and per city
      if (showToasts && !hasShownCachedToast && lastCachedLocationCity !== cachedLocation.city) {
        toast.success(`Using cached location: ${cachedLocation.city}`, { duration: 3000 });
        hasShownCachedToast = true;
        lastCachedLocationCity = cachedLocation.city;
      }
      return cachedLocation;
    }

    // If no cache, request new location
    if (showToasts) {
      toast.loading('Getting your location...', { id: 'geolocation' });
    }

    const position = await getCurrentPosition();
    
    if (showToasts) {
      toast.loading('Looking up your city...', { id: 'geolocation' });
    }

    // Reverse geocode to get city name
    const locationInfo = await reverseGeocode(
      position.latitude, 
      position.longitude
    );

    // Add additional position data
    const fullLocationInfo = {
      ...locationInfo,
      accuracy: position.accuracy,
      timestamp: position.timestamp,
      source: 'geolocation'
    };

    // Cache the location
    cacheLocation(fullLocationInfo);

    if (showToasts) {
      toast.success(`Location found: ${locationInfo.city}`, { id: 'geolocation' });
    }

    return fullLocationInfo;

  } catch (error) {
    if (showToasts) {
      toast.error(error.message, { id: 'geolocation' });
    }
    
    console.error('Geolocation error:', error);
    
    // Return a fallback location (Mumbai as default for Indian users)
    return {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      fullAddress: 'Mumbai, Maharashtra, India (Default)',
      coordinates: {
        lat: '19.0760',
        lon: '72.8777'
      },
      source: 'fallback',
      error: error.message
    };
  }
};

// Watch user location for continuous updates
export const watchUserLocation = (callback, options = {}) => {
  if (!isGeolocationSupported()) {
    callback(null, new Error('Geolocation not supported'));
    return null;
  }

  const watchOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 2 * 60 * 1000, // 2 minutes
    ...options
  };

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      try {
        const locationInfo = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );

        const fullLocationInfo = {
          ...locationInfo,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          source: 'geolocation_watch'
        };

        // Update cache
        cacheLocation(fullLocationInfo);
        
        callback(fullLocationInfo, null);
      } catch (error) {
        callback(null, error);
      }
    },
    (error) => {
      callback(null, error);
    },
    watchOptions
  );

  return watchId;
};

// Stop watching location
export const stopWatchingLocation = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Clear cached location
export const clearLocationCache = () => {
  deleteCookie(GEOLOCATION_COOKIE_KEY);
  // Reset toast flags when cache is cleared
  hasShownCachedToast = false;
  lastCachedLocationCity = null;
  toast.success('Location cache cleared');
};

// Check if user has granted location permission
export const checkLocationPermission = async () => {
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

// Request location permission explicitly
export const requestLocationPermission = async () => {
  try {
    const position = await getCurrentPosition();
    return {
      granted: true,
      position
    };
  } catch (error) {
    return {
      granted: false,
      error: error.message
    };
  }
};

const geolocationService = {
  getUserLocation,
  watchUserLocation,
  stopWatchingLocation,
  clearLocationCache,
  checkLocationPermission,
  requestLocationPermission,
  isGeolocationSupported,
  getCachedLocation
};

export default geolocationService;