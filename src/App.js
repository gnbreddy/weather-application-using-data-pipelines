import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WeatherPrediction from './pages/WeatherPrediction';
import RealTimeWeatherPage from './pages/RealTimeWeather';
import DataPipeline from './pages/DataPipeline';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Check if settings should be enabled (for admin/development mode only)
  const enableSettings = process.env.REACT_APP_ENABLE_SETTINGS === 'true' || process.env.REACT_APP_ADMIN_MODE === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prediction" element={<WeatherPrediction />} />
              <Route path="/realtime" element={<RealTimeWeatherPage />} />
              <Route path="/pipeline" element={<DataPipeline />} />
              <Route path="/analytics" element={<Analytics />} />
              {/* Only render Settings route if enabled (admin mode) */}
              {enableSettings && <Route path="/settings" element={<Settings />} />}
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
