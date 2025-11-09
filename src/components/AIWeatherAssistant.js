import React, { useState } from 'react';
import { Sparkles, MessageSquare, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import geminiService from '../services/gemini';

const AIWeatherAssistant = ({ weatherData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    toast.loading('Generating AI analysis...', { id: 'ai-analysis' });

    try {
      const result = await geminiService.generateWeatherAnalysis({
        location: weatherData.location.name,
        temperature: weatherData.current.temp_c,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.wind_kph,
        conditions: weatherData.current.condition.text
      });

      if (result.success) {
        setAnalysis(result.analysis);
        toast.success('AI analysis generated!', { id: 'ai-analysis' });
      } else {
        toast.error(result.error || 'Failed to generate analysis', { id: 'ai-analysis' });
        setAnalysis(result.fallback);
      }
    } catch (error) {
      toast.error('Failed to generate AI analysis', { id: 'ai-analysis' });
      console.error('AI Analysis Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    toast.loading('Generating recommendations...', { id: 'ai-recommendations' });

    try {
      const result = await geminiService.getWeatherRecommendations({
        temperature: weatherData.current.temp_c,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.wind_kph,
        conditions: weatherData.current.condition.text
      });

      if (result.success) {
        setAnalysis(result.recommendations);
        toast.success('Recommendations generated!', { id: 'ai-recommendations' });
      } else {
        toast.error(result.error || 'Failed to generate recommendations', { id: 'ai-recommendations' });
        setAnalysis(result.fallback);
      }
    } catch (error) {
      toast.error('Failed to generate recommendations', { id: 'ai-recommendations' });
      console.error('AI Recommendations Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrediction = async () => {
    setLoading(true);
    toast.loading('Generating AI prediction...', { id: 'ai-prediction' });

    try {
      const result = await geminiService.generateWeatherPrediction(
        weatherData.location.name,
        7
      );

      if (result.success) {
        setAnalysis(result.prediction);
        toast.success('Prediction generated!', { id: 'ai-prediction' });
      } else {
        toast.error(result.error || 'Failed to generate prediction', { id: 'ai-prediction' });
        setAnalysis(result.fallback);
      }
    } catch (error) {
      toast.error('Failed to generate AI prediction', { id: 'ai-prediction' });
      console.error('AI Prediction Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Weather Assistant</h3>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
            Powered by Gemini AI
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Get AI-powered weather insights, recommendations, and predictions using Google's Gemini AI
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <button
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Weather Analysis</span>
        </button>

        <button
          onClick={handleGenerateRecommendations}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Recommendations</span>
        </button>

        <button
          onClick={handleGeneratePrediction}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">AI Prediction</span>
        </button>
      </div>

      {/* Analysis Display */}
      {analysis && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">AI Insights</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-sm text-gray-600">Generating AI insights...</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> AI-generated insights are for informational purposes only. 
            Always refer to official weather sources for critical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIWeatherAssistant;
