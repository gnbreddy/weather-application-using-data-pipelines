import axios from 'axios';

// Gemini AI API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const GEMINI_API_KEYS = [
  process.env.REACT_APP_GEMINI_API_KEY_1 || 'AIzaSyC8PkxwIf95I6-DLn9j9rKFvJXSMIfH7Fc',
  process.env.REACT_APP_GEMINI_API_KEY_2 || 'AIzaSyDRhg51LpPA0Xy100B4y9XC72lbnzln44o',
  process.env.REACT_APP_GEMINI_API_KEY_3 || 'AIzaSyCA3yr2iO7EhaBGmadwqmW2vRZnNRZNqHc'
];

// Log loaded keys (masked for security)
console.log('🔑 Loaded Gemini API keys:', GEMINI_API_KEYS.map((key, i) => 
  `Key ${i + 1}: ${key ? key.substring(0, 10) + '...' : 'MISSING'}`
));

// Track which API key is currently being used
let currentKeyIndex = 0;

/**
 * Make a Gemini AI API call with automatic fallback to next key on failure
 */
const makeGeminiAPICall = async (prompt, retryCount = 0) => {
  if (retryCount >= GEMINI_API_KEYS.length) {
    console.error('❌ All Gemini API keys exhausted after', retryCount, 'attempts');
    console.error('💡 Possible issues:');
    console.error('   1. API keys may be invalid or expired');
    console.error('   2. Gemini API may not be enabled for these keys');
    console.error('   3. API keys may have billing/quota restrictions');
    console.error('   4. Check https://makersuite.google.com/app/apikey to verify keys');
    throw new Error('All Gemini API keys exhausted. Please verify your API keys are valid and have the Gemini API enabled.');
  }

  const apiKey = GEMINI_API_KEYS[currentKeyIndex];
  
  // Validate API key exists
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ API key is empty or undefined at index', currentKeyIndex);
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    return makeGeminiAPICall(prompt, retryCount + 1);
  }
  
  try {
    console.log(`🤖 Attempting Gemini API call with key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`✅ Gemini API call successful with key ${currentKeyIndex + 1}`);
    return response.data;

  } catch (error) {
    console.warn(`⚠️ Gemini API key ${currentKeyIndex + 1} failed:`, error.message);
    console.error('Full error details:', error.response?.data || error);
    
    // Check if it's a rate limit or auth error
    const isRateLimitError = error.response?.status === 429;
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isNetworkError = !error.response;
    const isBadRequest = error.response?.status === 400;
    
    if (isRateLimitError) {
      console.log('⏱️ Rate limit exceeded, trying next key...');
    } else if (isAuthError) {
      console.log('🔑 Authentication failed - API key may be invalid or restricted');
      console.log('Error details:', error.response?.data?.error?.message || 'No details available');
    } else if (isBadRequest) {
      console.log('❌ Bad request - check API configuration');
      console.log('Error details:', error.response?.data?.error?.message || 'No details available');
    } else if (isNetworkError) {
      console.log('🌐 Network error, trying next key...');
    } else {
      console.log('❓ Unknown error:', error.response?.status, error.response?.statusText);
    }

    // Move to next key
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    
    // Retry with next key
    return makeGeminiAPICall(prompt, retryCount + 1);
  }
};

/**
 * Generate weather analysis using Gemini AI
 */
export const generateWeatherAnalysis = async (weatherData) => {
  const prompt = `Analyze the following weather data and provide insights:
  
Location: ${weatherData.location}
Temperature: ${weatherData.temperature}°C
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.windSpeed} km/h
Conditions: ${weatherData.conditions}

Please provide:
1. A brief weather summary
2. Recommendations for outdoor activities
3. Any weather warnings or precautions
4. 24-hour forecast prediction

Keep the response concise and practical.`;

  try {
    const response = await makeGeminiAPICall(prompt);
    
    if (response.candidates && response.candidates.length > 0) {
      const text = response.candidates[0].content.parts[0].text;
      return {
        success: true,
        analysis: text,
        model: 'gemini-pro'
      };
    }
    
    throw new Error('No response from Gemini AI');
  } catch (error) {
    console.error('❌ Gemini AI analysis failed:', error);
    
    // Provide a helpful fallback analysis
    const fallbackAnalysis = `Weather Analysis for ${weatherData.location}

Current Conditions:
• Temperature: ${weatherData.temperature}°C
• Humidity: ${weatherData.humidity}%
• Wind Speed: ${weatherData.windSpeed} km/h
• Conditions: ${weatherData.conditions}

Note: AI-powered analysis is temporarily unavailable. This is basic weather data from our API.

Recommendations:
${weatherData.temperature > 30 ? '• Stay hydrated and avoid prolonged sun exposure' : ''}
${weatherData.temperature < 15 ? '• Dress warmly and layer your clothing' : ''}
${weatherData.humidity > 70 ? '• High humidity - may feel warmer than actual temperature' : ''}
${weatherData.windSpeed > 30 ? '• Strong winds - secure loose objects outdoors' : ''}

Please try again later for AI-powered insights.`;

    return {
      success: false,
      error: error.message,
      fallback: fallbackAnalysis
    };
  }
};

/**
 * Generate weather predictions using Gemini AI
 */
export const generateWeatherPrediction = async (location, days = 7) => {
  const prompt = `Generate a ${days}-day weather forecast for ${location}. 
  
Please provide:
1. Daily temperature ranges (min/max)
2. Precipitation probability
3. General weather conditions
4. Any notable weather patterns

Format the response as a structured prediction for each day.`;

  try {
    const response = await makeGeminiAPICall(prompt);
    
    if (response.candidates && response.candidates.length > 0) {
      const text = response.candidates[0].content.parts[0].text;
      return {
        success: true,
        prediction: text,
        model: 'gemini-pro',
        location: location,
        days: days
      };
    }
    
    throw new Error('No response from Gemini AI');
  } catch (error) {
    console.error('❌ Gemini AI prediction failed:', error);
    
    // Try to fetch real forecast data as fallback
    try {
      const weatherAPI = require('./api').weatherAPI;
      const forecastData = await weatherAPI.getWeatherForecast(location, Math.min(days, 10));
      
      if (forecastData && forecastData.forecast) {
        // Generate a structured prediction from real data
        let fallbackPrediction = `${days}-Day Weather Forecast for ${location}\n\n`;
        fallbackPrediction += `📍 Location: ${forecastData.location.name}, ${forecastData.location.region}\n`;
        fallbackPrediction += `🌍 Coordinates: ${forecastData.location.lat}°N, ${forecastData.location.lon}°E\n\n`;
        fallbackPrediction += `Note: AI predictions unavailable. Showing real forecast data from WeatherAPI.com\n\n`;
        fallbackPrediction += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        forecastData.forecast.forecastday.forEach((day, index) => {
          const date = new Date(day.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          
          fallbackPrediction += `Day ${index + 1}: ${dayName}\n`;
          fallbackPrediction += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          fallbackPrediction += `🌡️  Temperature: ${day.day.mintemp_c}°C - ${day.day.maxtemp_c}°C (Avg: ${day.day.avgtemp_c}°C)\n`;
          fallbackPrediction += `☁️  Conditions: ${day.day.condition.text}\n`;
          fallbackPrediction += `💧 Precipitation: ${day.day.totalprecip_mm}mm (${day.day.daily_chance_of_rain}% chance of rain)\n`;
          fallbackPrediction += `💨 Wind: ${day.day.maxwind_kph} km/h\n`;
          fallbackPrediction += `💦 Humidity: ${day.day.avghumidity}%\n`;
          fallbackPrediction += `👁️  Visibility: ${day.day.avgvis_km} km\n`;
          fallbackPrediction += `☀️  UV Index: ${day.day.uv}\n\n`;
        });
        
        fallbackPrediction += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        fallbackPrediction += `\n📊 Summary:\n`;
        const avgTemp = forecastData.forecast.forecastday.reduce((sum, d) => sum + d.day.avgtemp_c, 0) / forecastData.forecast.forecastday.length;
        const totalRain = forecastData.forecast.forecastday.reduce((sum, d) => sum + d.day.totalprecip_mm, 0);
        fallbackPrediction += `• Average Temperature: ${avgTemp.toFixed(1)}°C\n`;
        fallbackPrediction += `• Total Precipitation: ${totalRain.toFixed(1)}mm\n`;
        fallbackPrediction += `• Conditions vary from ${forecastData.forecast.forecastday[0].day.condition.text} to ${forecastData.forecast.forecastday[forecastData.forecast.forecastday.length - 1].day.condition.text}\n`;
        
        return {
          success: false,
          error: error.message,
          fallback: fallbackPrediction,
          hasRealData: true
        };
      }
    } catch (apiError) {
      console.error('❌ Failed to fetch fallback forecast data:', apiError);
    }
    
    // If we can't get real data, provide basic guidance
    const basicFallback = `${days}-Day Weather Prediction for ${location}

⚠️ AI predictions and forecast data are temporarily unavailable.

📍 Alternative Options:
• Visit the Analytics page and search for "${location}" to see real-time forecast
• Use the Weather Prediction page for detailed city forecasts
• Check the Real-Time Weather section for current conditions

💡 Tips:
• Weather patterns typically remain stable for 2-3 days
• Check humidity levels for rain probability
• Monitor wind speeds for outdoor activity planning
• Temperature variations are usually gradual

For the most accurate ${days}-day forecast, please try the Analytics page with the city search feature.`;

    return {
      success: false,
      error: error.message,
      fallback: basicFallback,
      hasRealData: false
    };
  }
};

/**
 * Get weather recommendations using Gemini AI
 */
export const getWeatherRecommendations = async (weatherData) => {
  const prompt = `Based on the current weather conditions:
  
Temperature: ${weatherData.temperature}°C
Humidity: ${weatherData.humidity}%
Wind: ${weatherData.windSpeed} km/h
Conditions: ${weatherData.conditions}

Provide practical recommendations for:
1. Clothing suggestions
2. Travel advisories
3. Health precautions
4. Best times for outdoor activities

Keep recommendations brief and actionable.`;

  try {
    const response = await makeGeminiAPICall(prompt);
    
    if (response.candidates && response.candidates.length > 0) {
      const text = response.candidates[0].content.parts[0].text;
      return {
        success: true,
        recommendations: text,
        model: 'gemini-pro'
      };
    }
    
    throw new Error('No response from Gemini AI');
  } catch (error) {
    console.error('❌ Gemini AI recommendations failed:', error);
    
    // Provide helpful fallback recommendations
    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const wind = weatherData.windSpeed;
    
    const fallbackRecommendations = `Weather Recommendations

📋 Clothing Suggestions:
${temp > 30 ? '• Light, breathable clothing\n• Sun hat and sunglasses\n• Light colors to reflect heat' : ''}
${temp >= 20 && temp <= 30 ? '• Comfortable casual wear\n• Light jacket for evening\n• Comfortable footwear' : ''}
${temp < 20 ? '• Warm layers\n• Jacket or sweater\n• Long pants recommended' : ''}

🚗 Travel Advisories:
${wind > 40 ? '• Strong winds - drive carefully\n• Secure loose items\n• Avoid high-profile vehicles' : ''}
${wind <= 40 ? '• Normal travel conditions\n• Standard precautions apply' : ''}

💪 Health Precautions:
${temp > 30 ? '• Stay hydrated - drink plenty of water\n• Avoid prolonged sun exposure\n• Use sunscreen (SPF 30+)' : ''}
${humidity > 70 ? '• High humidity - may feel warmer\n• Take breaks in air-conditioned spaces\n• Monitor for heat exhaustion' : ''}
${temp < 15 ? '• Protect against cold\n• Watch for hypothermia signs\n• Keep extremities warm' : ''}

⏰ Best Times for Outdoor Activities:
${temp > 30 ? '• Early morning (6-9 AM)\n• Late evening (after 6 PM)\n• Avoid midday heat' : ''}
${temp >= 20 && temp <= 30 ? '• Anytime during daylight\n• Ideal conditions for outdoor activities\n• Morning and evening are most pleasant' : ''}
${temp < 20 ? '• Midday when warmest\n• Dress appropriately for temperature\n• Consider indoor alternatives' : ''}

Note: AI-powered recommendations are temporarily unavailable. These are basic guidelines based on current conditions.`;

    return {
      success: false,
      error: error.message,
      fallback: fallbackRecommendations
    };
  }
};

/**
 * Compare weather between multiple cities using Gemini AI
 */
export const compareWeatherBetweenCities = async (citiesData) => {
  const citiesInfo = citiesData.map(city => 
    `${city.name}: ${city.temperature}°C, ${city.conditions}`
  ).join('\n');

  const prompt = `Compare the weather conditions between these cities:

${citiesInfo}

Provide:
1. Which city has the best weather today
2. Key differences in weather patterns
3. Travel recommendations based on weather

Keep the comparison concise and helpful.`;

  try {
    const response = await makeGeminiAPICall(prompt);
    
    if (response.candidates && response.candidates.length > 0) {
      const text = response.candidates[0].content.parts[0].text;
      return {
        success: true,
        comparison: text,
        model: 'gemini-pro'
      };
    }
    
    throw new Error('No response from Gemini AI');
  } catch (error) {
    console.error('❌ Gemini AI comparison failed:', error);
    return {
      success: false,
      error: error.message,
      fallback: 'Unable to generate comparison at this time.'
    };
  }
};

/**
 * Test all Gemini API keys
 */
export const testGeminiAPIKeys = async () => {
  console.log('🔍 Testing all Gemini API keys...');
  
  const results = await Promise.all(
    GEMINI_API_KEYS.map(async (key, index) => {
      try {
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${key}`,
          {
            contents: [{
              parts: [{
                text: 'Hello, this is a test message.'
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        return {
          keyIndex: index + 1,
          key: key.substring(0, 10) + '...',
          status: 'valid',
          working: true
        };
      } catch (error) {
        return {
          keyIndex: index + 1,
          key: key.substring(0, 10) + '...',
          status: 'invalid',
          working: false,
          error: error.message
        };
      }
    })
  );

  const summary = {
    total: GEMINI_API_KEYS.length,
    working: results.filter(r => r.working).length,
    failed: results.filter(r => !r.working).length,
    results: results
  };

  console.log('🔑 Gemini API Keys Test Results:', summary);
  return summary;
};

const geminiService = {
  generateWeatherAnalysis,
  generateWeatherPrediction,
  getWeatherRecommendations,
  compareWeatherBetweenCities,
  testGeminiAPIKeys
};

export default geminiService;
