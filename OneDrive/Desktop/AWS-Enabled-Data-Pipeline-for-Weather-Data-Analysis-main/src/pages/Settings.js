import React, { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  Key, 
  Database, 
  Bell, 
  Shield,
  Cloud,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import WeatherAPITest from '../components/WeatherAPITest';
import WeatherAPIDemo from '../components/WeatherAPIDemo';

const Settings = () => {
  const [settings, setSettings] = useState({
    // AWS Configuration
    awsRegion: 'us-west-2',
    s3Bucket: 'weather-data-pipeline-bucket',
    lambdaTimeout: 300,
    mlModelEndpoint: 'weather-prediction-endpoint',
    
    // Data Pipeline
    dataRetentionDays: 365,
    processingBatchSize: 1000,
    maxRetries: 3,
    enableAutoScaling: true,
    
    // Notifications
    emailNotifications: true,
    slackNotifications: false,
    alertThreshold: 0.95,
    
    // Security
    enableEncryption: true,
    enableAuditLogs: true,
    apiRateLimit: 1000
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (service) => {
    // Simulate connection test
    console.log(`Testing ${service} connection...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your weather data pipeline and AWS services
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`p-4 rounded-lg flex items-center ${
          saveStatus === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {saveStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${
            saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {saveStatus === 'success' 
              ? 'Settings saved successfully!' 
              : 'Failed to save settings. Please try again.'
            }
          </span>
        </div>
      )}

      {/* AWS Configuration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Cloud className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AWS Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Region
            </label>
            <select
              name="awsRegion"
              value={settings.awsRegion}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="us-west-2">US West (Oregon)</option>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              S3 Bucket Name
            </label>
            <input
              type="text"
              name="s3Bucket"
              value={settings.s3Bucket}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lambda Timeout (seconds)
            </label>
            <input
              type="number"
              name="lambdaTimeout"
              value={settings.lambdaTimeout}
              onChange={handleInputChange}
              className="input-field"
              min="60"
              max="900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ML Model Endpoint
            </label>
            <input
              type="text"
              name="mlModelEndpoint"
              value={settings.mlModelEndpoint}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => testConnection('AWS')}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test AWS Connection
          </button>
        </div>
      </div>

      {/* Data Pipeline Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Data Pipeline Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              name="dataRetentionDays"
              value={settings.dataRetentionDays}
              onChange={handleInputChange}
              className="input-field"
              min="30"
              max="3650"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Batch Size
            </label>
            <input
              type="number"
              name="processingBatchSize"
              value={settings.processingBatchSize}
              onChange={handleInputChange}
              className="input-field"
              min="100"
              max="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Retries
            </label>
            <input
              type="number"
              name="maxRetries"
              value={settings.maxRetries}
              onChange={handleInputChange}
              className="input-field"
              min="1"
              max="10"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="enableAutoScaling"
              checked={settings.enableAutoScaling}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Enable Auto Scaling
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Slack Notifications</label>
              <p className="text-xs text-gray-500">Receive alerts via Slack</p>
            </div>
            <input
              type="checkbox"
              name="slackNotifications"
              checked={settings.slackNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Threshold
            </label>
            <input
              type="range"
              name="alertThreshold"
              value={settings.alertThreshold}
              onChange={handleInputChange}
              min="0.5"
              max="1.0"
              step="0.05"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current threshold: {(settings.alertThreshold * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Encryption</label>
              <p className="text-xs text-gray-500">Encrypt data at rest and in transit</p>
            </div>
            <input
              type="checkbox"
              name="enableEncryption"
              checked={settings.enableEncryption}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Audit Logs</label>
              <p className="text-xs text-gray-500">Log all system activities</p>
            </div>
            <input
              type="checkbox"
              name="enableAuditLogs"
              checked={settings.enableAuditLogs}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              name="apiRateLimit"
              value={settings.apiRateLimit}
              onChange={handleInputChange}
              className="input-field"
              min="100"
              max="10000"
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Key className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Access Key ID
            </label>
            <input
              type="password"
              placeholder="Enter your AWS Access Key ID"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Secret Access Key
            </label>
            <input
              type="password"
              placeholder="Enter your AWS Secret Access Key"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NOAA API Key
            </label>
            <input
              type="password"
              placeholder="Enter your NOAA API Key"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tomorrow.io API Key
            </label>
            <input
              type="password"
              value="CWOJitI265oS65Urb3fKjQsJmvjBHcoI"
              readOnly
              className="input-field bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Tomorrow.io weather data API key (configured)</p>
          </div>
        </div>
      </div>

      {/* Weather API Testing */}
      <WeatherAPITest />

      {/* Weather API Demo */}
      <WeatherAPIDemo />
    </div>
  );
};

export default Settings;
