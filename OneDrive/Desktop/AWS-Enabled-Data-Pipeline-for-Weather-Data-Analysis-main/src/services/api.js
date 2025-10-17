import axios from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.weather-pipeline.com";
const OPEN_METEO_API =
  process.env.REACT_APP_OPEN_METEO_API || "https://api.open-meteo.com/v1";
const WEATHER_API_URL =
  process.env.REACT_APP_WEATHER_API_URL || "https://api.weatherapi.com/v1";
const WEATHER_API_KEY_PRIMARY =
  process.env.REACT_APP_WEATHER_API_KEY || "19978c5b839242f3bb355837251710";
const WEATHER_API_KEY_FALLBACK =
  process.env.REACT_APP_WEATHER_API_KEY_FALLBACK ||
  "CWOJitI265oS65Urb3fKjQsJmvjBHcoI";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Utility function to round to 3 decimal places
const roundTo3Decimals = (value) => {
  return parseFloat(value).toFixed(3);
};

// Helper function to make API calls with fallback key
const makeWeatherAPICall = async (endpoint, params) => {
  // Try with primary API key first
  try {
    const response = await axios.get(`${WEATHER_API_URL}/${endpoint}`, {
      params: { ...params, key: WEATHER_API_KEY_PRIMARY },
      timeout: 10000, // 10 second timeout
    });
    console.log(
      "✅ Weather API call successful with primary key for",
      endpoint
    );
    return response;
  } catch (primaryError) {
    console.warn(
      "⚠️ Primary API key failed, trying fallback key:",
      primaryError.message
    );

    // Check if it's an API key issue or network issue
    const isAPIKeyError =
      primaryError.response?.status === 401 ||
      primaryError.response?.status === 403;
    const isRateLimitError = primaryError.response?.status === 429;

    if (isAPIKeyError) {
      console.log("🔑 API key authentication failed, switching to fallback");
    } else if (isRateLimitError) {
      console.log(
        "⏱️ Rate limit exceeded on primary key, switching to fallback"
      );
    }

    // If primary key fails, try with fallback key
    try {
      const response = await axios.get(`${WEATHER_API_URL}/${endpoint}`, {
        params: { ...params, key: WEATHER_API_KEY_FALLBACK },
        timeout: 10000, // 10 second timeout
      });
      console.log(
        "✅ Weather API call successful with fallback key for",
        endpoint
      );
      return response;
    } catch (fallbackError) {
      console.error("❌ Both API keys failed for", endpoint, ":", {
        primary: {
          message: primaryError.message,
          status: primaryError.response?.status,
          data: primaryError.response?.data,
        },
        fallback: {
          message: fallbackError.message,
          status: fallbackError.response?.status,
          data: fallbackError.response?.data,
        },
      });
      throw fallbackError;
    }
  }
};

// Function to test API key validity
const testAPIKey = async (apiKey) => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: apiKey,
        q: "London", // Test with a simple location
        aqi: "no",
      },
      timeout: 5000,
    });
    return { valid: true, response: response.data };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

// Geocoding function to get coordinates for any city
const geocodeCity = async (cityName) => {
  try {
    // Use a free geocoding service (OpenStreetMap Nominatim)
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: cityName,
          format: "json",
          limit: 1,
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name,
      };
    }

    // Fallback to predefined coordinates if geocoding fails
    const cityCoordinates = {
      "San Francisco": { lat: 37.7749, lon: -122.4194 },
      "New York": { lat: 40.7128, lon: -74.006 },
      London: { lat: 51.5074, lon: -0.1278 },
      Tokyo: { lat: 35.6762, lon: 139.6503 },
      Sydney: { lat: -33.8688, lon: 151.2093 },
      Paris: { lat: 48.8566, lon: 2.3522 },
      Mumbai: { lat: 19.076, lon: 72.8777 },
      "Los Angeles": { lat: 34.0522, lon: -118.2437 },
      Chicago: { lat: 41.8781, lon: -87.6298 },
      Miami: { lat: 25.7617, lon: -80.1918 },
    };

    return cityCoordinates[cityName] || cityCoordinates["San Francisco"];
  } catch (error) {
    console.warn(
      "Geocoding failed, using fallback coordinates:",
      error.message
    );
    return { lat: 37.7749, lon: -122.4194 }; // San Francisco as fallback
  }
};

// Weather Data API
export const weatherAPI = {
  // Test API keys functionality
  testAPIKeys: async () => {
    console.log("🔍 Testing Weather API keys...");

    const primaryTest = await testAPIKey(WEATHER_API_KEY_PRIMARY);
    const fallbackTest = await testAPIKey(WEATHER_API_KEY_FALLBACK);

    const results = {
      primary: {
        key: WEATHER_API_KEY_PRIMARY.substring(0, 8) + "...",
        valid: primaryTest.valid,
        error: primaryTest.error,
        status: primaryTest.status,
      },
      fallback: {
        key: WEATHER_API_KEY_FALLBACK.substring(0, 8) + "...",
        valid: fallbackTest.valid,
        error: fallbackTest.error,
        status: fallbackTest.status,
      },
      summary: {
        hasValidKey: primaryTest.valid || fallbackTest.valid,
        bothValid: primaryTest.valid && fallbackTest.valid,
        primaryWorking: primaryTest.valid,
        fallbackWorking: fallbackTest.valid,
      },
    };

    console.log("🔑 API Key Test Results:", results);
    return results;
  },
  // Get real-time weather data from WeatherAPI.com
  getRealTimeWeather: async (location) => {
    try {
      const response = await makeWeatherAPICall("current.json", {
        q: location,
        aqi: "yes",
      });

      const data = response.data;

      // Transform WeatherAPI.com data to match our expected format with 3 decimal precision
      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          localtime: data.location.localtime,
          coordinates: {
            lat: parseFloat(data.location.lat).toFixed(3),
            lon: parseFloat(data.location.lon).toFixed(3),
          },
        },
        current: {
          temp_c: parseFloat(data.current.temp_c).toFixed(3),
          temp_f: parseFloat(data.current.temp_f).toFixed(3),
          feelslike_c: parseFloat(data.current.feelslike_c).toFixed(3),
          feelslike_f: parseFloat(data.current.feelslike_f).toFixed(3),
          condition: {
            text: data.current.condition.text,
            code: data.current.condition.code,
            icon: data.current.condition.icon,
          },
          humidity: parseFloat(data.current.humidity).toFixed(3),
          precip_mm: parseFloat(data.current.precip_mm).toFixed(3),
          precip_in: parseFloat(data.current.precip_in).toFixed(3),
          wind_kph: parseFloat(data.current.wind_kph).toFixed(3),
          wind_mph: parseFloat(data.current.wind_mph).toFixed(3),
          wind_dir: data.current.wind_dir,
          wind_degree: parseFloat(data.current.wind_degree).toFixed(3),
          gust_kph: parseFloat(data.current.gust_kph).toFixed(3),
          gust_mph: parseFloat(data.current.gust_mph).toFixed(3),
          vis_km: parseFloat(data.current.vis_km).toFixed(3),
          vis_miles: parseFloat(data.current.vis_miles).toFixed(3),
          uv: parseFloat(data.current.uv).toFixed(3),
          pressure_mb: parseFloat(data.current.pressure_mb).toFixed(3),
          pressure_in: parseFloat(data.current.pressure_in).toFixed(3),
          cloud: parseFloat(data.current.cloud).toFixed(3),
          windchill_c: parseFloat(data.current.windchill_c || 0).toFixed(3),
          windchill_f: parseFloat(data.current.windchill_f || 0).toFixed(3),
          heatindex_c: parseFloat(data.current.heatindex_c || 0).toFixed(3),
          heatindex_f: parseFloat(data.current.heatindex_f || 0).toFixed(3),
          dewpoint_c: parseFloat(data.current.dewpoint_c || 0).toFixed(3),
          dewpoint_f: parseFloat(data.current.dewpoint_f || 0).toFixed(3),
          last_updated: data.current.last_updated,
          last_updated_epoch: data.current.last_updated_epoch,
          is_day: data.current.is_day,
          air_quality: data.current.air_quality
            ? {
                co: parseFloat(data.current.air_quality.co || 0).toFixed(3),
                no2: parseFloat(data.current.air_quality.no2 || 0).toFixed(3),
                o3: parseFloat(data.current.air_quality.o3 || 0).toFixed(3),
                so2: parseFloat(data.current.air_quality.so2 || 0).toFixed(3),
                pm2_5: parseFloat(data.current.air_quality.pm2_5 || 0).toFixed(
                  3
                ),
                pm10: parseFloat(data.current.air_quality.pm10 || 0).toFixed(3),
                us_epa_index: data.current.air_quality["us-epa-index"] || 0,
                gb_defra_index: data.current.air_quality["gb-defra-index"] || 0,
              }
            : null,
        },
      };
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn("WeatherAPI.com API failed (both keys), using mock data:", {
        message: error.message,
        status: error.response?.status,
        location: location,
      });
      return {
        location: {
          name: location,
          region: "Mock Region",
          country: "Mock Country",
          localtime: new Date().toLocaleString(),
          coordinates: {
            lat: (37.7749).toFixed(3),
            lon: (-122.4194).toFixed(3),
          },
        },
        current: {
          temp_c: (22 + Math.random() * 10).toFixed(3),
          temp_f: (72 + Math.random() * 18).toFixed(3),
          feelslike_c: (24 + Math.random() * 8).toFixed(3),
          feelslike_f: (75 + Math.random() * 14).toFixed(3),
          condition: {
            text: "Partly cloudy",
            code: 1003,
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
          },
          humidity: (60 + Math.random() * 20).toFixed(3),
          precip_mm: (Math.random() * 2).toFixed(3),
          precip_in: (Math.random() * 0.08).toFixed(3),
          wind_kph: (10 + Math.random() * 15).toFixed(3),
          wind_mph: (6 + Math.random() * 9).toFixed(3),
          wind_dir: "SW",
          wind_degree: (225).toFixed(3),
          gust_kph: (15 + Math.random() * 20).toFixed(3),
          gust_mph: (9 + Math.random() * 12).toFixed(3),
          vis_km: (8 + Math.random() * 4).toFixed(3),
          vis_miles: (5 + Math.random() * 2.5).toFixed(3),
          uv: (Math.random() * 10).toFixed(3),
          pressure_mb: (1010 + Math.random() * 20).toFixed(3),
          pressure_in: (29.8 + Math.random() * 0.6).toFixed(3),
          cloud: (Math.random() * 100).toFixed(3),
          windchill_c: (20 + Math.random() * 5).toFixed(3),
          windchill_f: (68 + Math.random() * 9).toFixed(3),
          heatindex_c: (25 + Math.random() * 5).toFixed(3),
          heatindex_f: (77 + Math.random() * 9).toFixed(3),
          dewpoint_c: (15 + Math.random() * 5).toFixed(3),
          dewpoint_f: (59 + Math.random() * 9).toFixed(3),
          last_updated: new Date().toLocaleString(),
          last_updated_epoch: Math.floor(Date.now() / 1000),
          is_day: 1,
          air_quality: {
            co: (300 + Math.random() * 200).toFixed(3),
            no2: (20 + Math.random() * 30).toFixed(3),
            o3: (50 + Math.random() * 50).toFixed(3),
            so2: (10 + Math.random() * 20).toFixed(3),
            pm2_5: (10 + Math.random() * 40).toFixed(3),
            pm10: (20 + Math.random() * 60).toFixed(3),
            us_epa_index: Math.floor(Math.random() * 6) + 1,
            gb_defra_index: Math.floor(Math.random() * 10) + 1,
          },
        },
      };
    }
  },

  // Get weather forecast from WeatherAPI.com
  getWeatherForecast: async (location, days = 7) => {
    try {
      const response = await makeWeatherAPICall("forecast.json", {
        q: location,
        days: Math.min(days, 10), // WeatherAPI.com supports up to 10 days
        aqi: "yes",
        alerts: "yes",
      });

      const data = response.data;

      // Transform WeatherAPI.com forecast data with 3 decimal precision
      const forecastData = data.forecast.forecastday.map((day) => ({
        date: day.date,
        date_epoch: day.date_epoch,
        day: {
          maxtemp_c: parseFloat(day.day.maxtemp_c).toFixed(3),
          maxtemp_f: parseFloat(day.day.maxtemp_f).toFixed(3),
          mintemp_c: parseFloat(day.day.mintemp_c).toFixed(3),
          mintemp_f: parseFloat(day.day.mintemp_f).toFixed(3),
          avgtemp_c: parseFloat(day.day.avgtemp_c).toFixed(3),
          avgtemp_f: parseFloat(day.day.avgtemp_f).toFixed(3),
          maxwind_mph: parseFloat(day.day.maxwind_mph).toFixed(3),
          maxwind_kph: parseFloat(day.day.maxwind_kph).toFixed(3),
          totalprecip_mm: parseFloat(day.day.totalprecip_mm).toFixed(3),
          totalprecip_in: parseFloat(day.day.totalprecip_in).toFixed(3),
          totalsnow_cm: parseFloat(day.day.totalsnow_cm || 0).toFixed(3),
          avgvis_km: parseFloat(day.day.avgvis_km).toFixed(3),
          avgvis_miles: parseFloat(day.day.avgvis_miles).toFixed(3),
          avghumidity: parseFloat(day.day.avghumidity).toFixed(3),
          daily_will_it_rain: day.day.daily_will_it_rain,
          daily_will_it_snow: day.day.daily_will_it_snow,
          daily_chance_of_rain: parseFloat(
            day.day.daily_chance_of_rain
          ).toFixed(3),
          daily_chance_of_snow: parseFloat(
            day.day.daily_chance_of_snow
          ).toFixed(3),
          condition: {
            text: day.day.condition.text,
            icon: day.day.condition.icon,
            code: day.day.condition.code,
          },
          uv: parseFloat(day.day.uv).toFixed(3),
        },
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonrise: day.astro.moonrise,
          moonset: day.astro.moonset,
          moon_phase: day.astro.moon_phase,
          moon_illumination: parseFloat(day.astro.moon_illumination).toFixed(3),
          is_moon_up: day.astro.is_moon_up,
          is_sun_up: day.astro.is_sun_up,
        },
        hour: day.hour
          ? day.hour.map((hour) => ({
              time_epoch: hour.time_epoch,
              time: hour.time,
              temp_c: parseFloat(hour.temp_c).toFixed(3),
              temp_f: parseFloat(hour.temp_f).toFixed(3),
              is_day: hour.is_day,
              condition: {
                text: hour.condition.text,
                icon: hour.condition.icon,
                code: hour.condition.code,
              },
              wind_mph: parseFloat(hour.wind_mph).toFixed(3),
              wind_kph: parseFloat(hour.wind_kph).toFixed(3),
              wind_degree: parseFloat(hour.wind_degree).toFixed(3),
              wind_dir: hour.wind_dir,
              pressure_mb: parseFloat(hour.pressure_mb).toFixed(3),
              pressure_in: parseFloat(hour.pressure_in).toFixed(3),
              precip_mm: parseFloat(hour.precip_mm).toFixed(3),
              precip_in: parseFloat(hour.precip_in).toFixed(3),
              snow_cm: parseFloat(hour.snow_cm || 0).toFixed(3),
              humidity: parseFloat(hour.humidity).toFixed(3),
              cloud: parseFloat(hour.cloud).toFixed(3),
              feelslike_c: parseFloat(hour.feelslike_c).toFixed(3),
              feelslike_f: parseFloat(hour.feelslike_f).toFixed(3),
              windchill_c: parseFloat(hour.windchill_c || 0).toFixed(3),
              windchill_f: parseFloat(hour.windchill_f || 0).toFixed(3),
              heatindex_c: parseFloat(hour.heatindex_c || 0).toFixed(3),
              heatindex_f: parseFloat(hour.heatindex_f || 0).toFixed(3),
              dewpoint_c: parseFloat(hour.dewpoint_c || 0).toFixed(3),
              dewpoint_f: parseFloat(hour.dewpoint_f || 0).toFixed(3),
              will_it_rain: hour.will_it_rain,
              will_it_snow: hour.will_it_snow,
              vis_km: parseFloat(hour.vis_km).toFixed(3),
              vis_miles: parseFloat(hour.vis_miles).toFixed(3),
              chance_of_rain: parseFloat(hour.chance_of_rain).toFixed(3),
              chance_of_snow: parseFloat(hour.chance_of_snow).toFixed(3),
              gust_mph: parseFloat(hour.gust_mph).toFixed(3),
              gust_kph: parseFloat(hour.gust_kph).toFixed(3),
              uv: parseFloat(hour.uv).toFixed(3),
            }))
          : [],
      }));

      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          lat: parseFloat(data.location.lat).toFixed(3),
          lon: parseFloat(data.location.lon).toFixed(3),
          tz_id: data.location.tz_id,
          localtime_epoch: data.location.localtime_epoch,
          localtime: data.location.localtime,
        },
        forecast: {
          forecastday: forecastData,
        },
        alerts: data.alerts || [],
      };
    } catch (error) {
      // Fallback to mock forecast data
      console.warn(
        "WeatherAPI.com forecast API failed (both keys), using mock data:",
        {
          message: error.message,
          status: error.response?.status,
          location: location,
          days: days,
        }
      );
      const mockForecast = {
        location: { name: location, country: "Mock Location" },
        forecast: {
          forecastday: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            date_epoch: Math.floor(
              (Date.now() + i * 24 * 60 * 60 * 1000) / 1000
            ),
            day: {
              maxtemp_c: (20 + Math.random() * 15).toFixed(3),
              maxtemp_f: (68 + Math.random() * 27).toFixed(3),
              mintemp_c: (10 + Math.random() * 10).toFixed(3),
              mintemp_f: (50 + Math.random() * 18).toFixed(3),
              avgtemp_c: (15 + Math.random() * 12).toFixed(3),
              avgtemp_f: (59 + Math.random() * 22).toFixed(3),
              condition: {
                text: "Partly cloudy",
                icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
                code: 1003,
              },
              totalprecip_mm: (Math.random() * 5).toFixed(3),
              totalprecip_in: (Math.random() * 0.2).toFixed(3),
              avghumidity: (60 + Math.random() * 20).toFixed(3),
              uv: (Math.random() * 8).toFixed(3),
            },
          })),
        },
      };
      return mockForecast;
    }
  },

  // Get historical weather data from WeatherAPI.com
  getHistoricalWeatherAPI: async (location, date) => {
    try {
      const response = await makeWeatherAPICall("history.json", {
        q: location,
        dt: date, // Format: YYYY-MM-DD
      });

      const data = response.data;

      // Transform historical data with 3 decimal precision
      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          lat: parseFloat(data.location.lat).toFixed(3),
          lon: parseFloat(data.location.lon).toFixed(3),
          tz_id: data.location.tz_id,
          localtime_epoch: data.location.localtime_epoch,
          localtime: data.location.localtime,
        },
        forecast: {
          forecastday: data.forecast.forecastday.map((day) => ({
            date: day.date,
            date_epoch: day.date_epoch,
            day: {
              maxtemp_c: parseFloat(day.day.maxtemp_c).toFixed(3),
              maxtemp_f: parseFloat(day.day.maxtemp_f).toFixed(3),
              mintemp_c: parseFloat(day.day.mintemp_c).toFixed(3),
              mintemp_f: parseFloat(day.day.mintemp_f).toFixed(3),
              avgtemp_c: parseFloat(day.day.avgtemp_c).toFixed(3),
              avgtemp_f: parseFloat(day.day.avgtemp_f).toFixed(3),
              maxwind_mph: parseFloat(day.day.maxwind_mph).toFixed(3),
              maxwind_kph: parseFloat(day.day.maxwind_kph).toFixed(3),
              totalprecip_mm: parseFloat(day.day.totalprecip_mm).toFixed(3),
              totalprecip_in: parseFloat(day.day.totalprecip_in).toFixed(3),
              avgvis_km: parseFloat(day.day.avgvis_km).toFixed(3),
              avgvis_miles: parseFloat(day.day.avgvis_miles).toFixed(3),
              avghumidity: parseFloat(day.day.avghumidity).toFixed(3),
              condition: {
                text: day.day.condition.text,
                icon: day.day.condition.icon,
                code: day.day.condition.code,
              },
              uv: parseFloat(day.day.uv).toFixed(3),
            },
            astro: day.astro,
            hour: day.hour
              ? day.hour.map((hour) => ({
                  time_epoch: hour.time_epoch,
                  time: hour.time,
                  temp_c: parseFloat(hour.temp_c).toFixed(3),
                  temp_f: parseFloat(hour.temp_f).toFixed(3),
                  is_day: hour.is_day,
                  condition: hour.condition,
                  wind_mph: parseFloat(hour.wind_mph).toFixed(3),
                  wind_kph: parseFloat(hour.wind_kph).toFixed(3),
                  wind_degree: parseFloat(hour.wind_degree).toFixed(3),
                  wind_dir: hour.wind_dir,
                  pressure_mb: parseFloat(hour.pressure_mb).toFixed(3),
                  pressure_in: parseFloat(hour.pressure_in).toFixed(3),
                  precip_mm: parseFloat(hour.precip_mm).toFixed(3),
                  precip_in: parseFloat(hour.precip_in).toFixed(3),
                  humidity: parseFloat(hour.humidity).toFixed(3),
                  cloud: parseFloat(hour.cloud).toFixed(3),
                  feelslike_c: parseFloat(hour.feelslike_c).toFixed(3),
                  feelslike_f: parseFloat(hour.feelslike_f).toFixed(3),
                  vis_km: parseFloat(hour.vis_km).toFixed(3),
                  vis_miles: parseFloat(hour.vis_miles).toFixed(3),
                  gust_mph: parseFloat(hour.gust_mph).toFixed(3),
                  gust_kph: parseFloat(hour.gust_kph).toFixed(3),
                  uv: parseFloat(hour.uv).toFixed(3),
                }))
              : [],
          })),
        },
      };
    } catch (error) {
      console.warn("WeatherAPI.com historical API failed (both keys):", {
        message: error.message,
        status: error.response?.status,
        location: location,
        date: date,
      });
      throw error;
    }
  },

  // Get live weather data from Open-Meteo (backup)
  getLiveWeather: async (latitude, longitude, date) => {
    const response = await axios.get(`${OPEN_METEO_API}/forecast`, {
      params: {
        latitude,
        longitude,
        daily: [
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_sum",
          "rain_sum",
          "snowfall_sum",
        ],
        start_date: date,
        end_date: date,
        timezone: "auto",
      },
    });
    return response.data;
  },

  // Get current weather data
  getCurrentWeather: (location) =>
    api.get("/weather/current", { params: { location } }),

  // Get historical weather data
  getHistoricalWeather: (location, startDate, endDate) =>
    api.get("/weather/historical", {
      params: { location, startDate, endDate },
    }),

  // Get weather predictions
  getWeatherPrediction: (locationCategory, locationName, startDate, duration) =>
    api.post("/weather/predict", {
      locationCategory,
      locationName,
      startDate,
      duration: parseInt(duration),
    }),

  // Get weather analytics
  getWeatherAnalytics: (period, metric) =>
    api.get("/weather/analytics", {
      params: { period, metric },
    }),
};

// Data Pipeline API
export const pipelineAPI = {
  // Get pipeline status
  getPipelineStatus: () => api.get("/pipeline/status"),

  // Get pipeline logs
  getPipelineLogs: (limit = 100) =>
    api.get("/pipeline/logs", { params: { limit } }),

  // Start pipeline
  startPipeline: () => api.post("/pipeline/start"),

  // Stop pipeline
  stopPipeline: () => api.post("/pipeline/stop"),

  // Restart pipeline
  restartPipeline: () => api.post("/pipeline/restart"),

  // Get AWS services status
  getAWSServicesStatus: () => api.get("/pipeline/aws-services"),
};

// ML Model API
export const mlAPI = {
  // Get model information
  getModelInfo: () => api.get("/ml/model-info"),

  // Get model performance metrics
  getModelMetrics: () => api.get("/ml/metrics"),

  // Retrain model
  retrainModel: () => api.post("/ml/retrain"),

  // Get prediction accuracy
  getPredictionAccuracy: () => api.get("/ml/accuracy"),
};

// Settings API
export const settingsAPI = {
  // Get settings
  getSettings: () => api.get("/settings"),

  // Update settings
  updateSettings: (settings) => api.put("/settings", settings),

  // Test AWS connection
  testAWSConnection: () => api.post("/settings/test-aws"),

  // Test NOAA API connection
  testNOAAConnection: () => api.post("/settings/test-noaa"),
};

// Data Export API
export const exportAPI = {
  // Export weather data
  exportWeatherData: (format, filters) =>
    api.post(
      "/export/weather",
      { format, filters },
      {
        responseType: "blob",
      }
    ),

  // Export analytics data
  exportAnalyticsData: (format, period) =>
    api.post(
      "/export/analytics",
      { format, period },
      {
        responseType: "blob",
      }
    ),

  // Export pipeline logs
  exportPipelineLogs: (format, dateRange) =>
    api.post(
      "/export/logs",
      { format, dateRange },
      {
        responseType: "blob",
      }
    ),
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: "Network error - please check your connection",
      status: 0,
      details: "No response from server",
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: -1,
      details: "Unknown error",
    };
  }
};

export default api;
