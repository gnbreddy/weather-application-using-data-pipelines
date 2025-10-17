import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { weatherAPI } from '../services/api';

const WeatherAPITest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  const runTest = async (testName, testFunction, ...args) => {
    setTesting(prev => ({ ...prev, [testName]: true }));
    
    try {
      const startTime = Date.now();
      const result = await testFunction(...args);
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          data: result,
          responseTime: endTime - startTime,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      toast.success(`${testName} test passed!`);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      toast.error(`${testName} test failed: ${error.message}`);
    } finally {
      setTesting(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: 'Real-Time Weather',
      description: 'Test current weather API',
      action: () => runTest('realtime', weatherAPI.getRealTimeWeather, 'San Francisco')
    },
    {
      name: 'Weather Forecast',
      description: 'Test 7-day forecast API',
      action: () => runTest('forecast', weatherAPI.getWeatherForecast, 'New York', 7)
    },
    {
      name: 'Historical Weather',
      description: 'Test historical weather API',
      action: () => runTest('historical', weatherAPI.getHistoricalWeatherAPI, 'London', '2024-01-01')
    }
  ];

  const getStatusIcon = (testName) => {
    if (testing[testName]) {
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    const result = testResults[testName];
    if (!result) {
      return <Play className="h-5 w-5 text-gray-400" />;
    }
    
    return result.success 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await test.action();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Weather API Tests</h3>
        <button
          onClick={runAllTests}
          className="btn-primary"
          disabled={Object.values(testing).some(Boolean)}
        >
          Run All Tests
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.name.toLowerCase().replace(/[^a-z]/g, ''))}
                <div>
                  <h4 className="font-medium text-gray-900">{test.name}</h4>
                  <p className="text-sm text-gray-500">{test.description}</p>
                </div>
              </div>
              <button
                onClick={test.action}
                disabled={testing[test.name.toLowerCase().replace(/[^a-z]/g, '')]}
                className="btn-secondary"
              >
                Test
              </button>
            </div>

            {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')] && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Status: {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].success ? 'Success' : 'Failed'}
                  </span>
                  <span className="text-gray-500">
                    {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].timestamp}
                  </span>
                </div>
                
                {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].responseTime && (
                  <div className="text-sm text-gray-600 mt-1">
                    Response time: {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].responseTime}ms
                  </div>
                )}
                
                {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].error && (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].error}
                  </div>
                )}
                
                {testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].data && (
                  <details className="mt-2">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                      {JSON.stringify(testResults[test.name.toLowerCase().replace(/[^a-z]/g, '')].data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">API Configuration</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>API URL: {process.env.REACT_APP_WEATHER_API_URL}</div>
          <div>API Key: {process.env.REACT_APP_WEATHER_API_KEY ? '***configured***' : 'Not configured'}</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAPITest;