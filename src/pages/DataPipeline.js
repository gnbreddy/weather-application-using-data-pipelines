import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  TrendingUp,
  Activity,
  Server,
  FileText,
  BarChart3
} from 'lucide-react';

const DataPipeline = () => {
  const [pipelineStatus, setPipelineStatus] = useState('running');
  const [currentStep, setCurrentStep] = useState(0);

  // Mock pipeline steps
  const pipelineSteps = [
    {
      id: 1,
      name: 'Data Ingestion',
      description: 'Collecting weather data from NOAA APIs',
      status: 'completed',
      duration: '2m 15s',
      icon: Cloud,
      details: {
        recordsProcessed: 125000,
        dataSize: '2.3 GB',
        lastUpdate: '2 minutes ago'
      }
    },
    {
      id: 2,
      name: 'Data Validation',
      description: 'Validating and cleaning raw data',
      status: 'completed',
      duration: '1m 45s',
      icon: CheckCircle,
      details: {
        recordsProcessed: 125000,
        validRecords: 124500,
        invalidRecords: 500,
        lastUpdate: '1 minute ago'
      }
    },
    {
      id: 3,
      name: 'Data Transformation',
      description: 'Converting data to required format',
      status: 'running',
      duration: '3m 20s',
      icon: Activity,
      details: {
        recordsProcessed: 85000,
        totalRecords: 124500,
        progress: 68,
        lastUpdate: '30 seconds ago'
      }
    },
    {
      id: 4,
      name: 'ML Model Training',
      description: 'Training XGBoost model on processed data',
      status: 'pending',
      duration: '0s',
      icon: TrendingUp,
      details: {
        status: 'Waiting for data transformation',
        estimatedDuration: '15-20 minutes',
        lastUpdate: 'Not started'
      }
    },
    {
      id: 5,
      name: 'Data Storage',
      description: 'Storing processed data in S3',
      status: 'pending',
      duration: '0s',
      icon: Database,
      details: {
        status: 'Waiting for ML training',
        estimatedDuration: '5-10 minutes',
        lastUpdate: 'Not started'
      }
    }
  ];

  const awsServices = [
    {
      name: 'S3 Storage',
      status: 'healthy',
      usage: '45.2 GB',
      icon: Database,
      color: 'green'
    },
    {
      name: 'Lambda Functions',
      status: 'healthy',
      usage: '12 active',
      icon: Zap,
      color: 'green'
    },
    {
      name: 'SageMaker',
      status: 'healthy',
      usage: '1 training job',
      icon: TrendingUp,
      color: 'green'
    },
    {
      name: 'CloudWatch',
      status: 'warning',
      usage: 'High CPU usage',
      icon: Activity,
      color: 'yellow'
    },
    {
      name: 'Glue ETL',
      status: 'healthy',
      usage: '3 jobs running',
      icon: FileText,
      color: 'green'
    },
    {
      name: 'QuickSight',
      status: 'healthy',
      usage: '2 dashboards',
      icon: BarChart3,
      color: 'green'
    }
  ];

  const recentLogs = [
    {
      timestamp: '2023-12-30 14:32:15',
      level: 'INFO',
      message: 'Data ingestion completed successfully',
      service: 'Lambda-DataIngestion'
    },
    {
      timestamp: '2023-12-30 14:30:42',
      level: 'WARN',
      message: 'High memory usage detected in transformation step',
      service: 'Glue-ETL'
    },
    {
      timestamp: '2023-12-30 14:28:33',
      level: 'INFO',
      message: 'Validation completed: 99.6% data quality score',
      service: 'Lambda-Validation'
    },
    {
      timestamp: '2023-12-30 14:25:18',
      level: 'ERROR',
      message: 'Failed to connect to NOAA API endpoint',
      service: 'Lambda-DataIngestion'
    },
    {
      timestamp: '2023-12-30 14:23:45',
      level: 'INFO',
      message: 'Pipeline execution started',
      service: 'Airflow-DAG'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'running':
        return <Activity className="h-5 w-5 animate-pulse" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'INFO':
        return 'text-blue-600 bg-blue-100';
      case 'WARN':
        return 'text-yellow-600 bg-yellow-100';
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Data Pipeline Monitoring
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage your AWS data pipeline in real-time
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button className="btn-secondary">
            <Zap className="h-4 w-4 mr-2" />
            Restart Pipeline
          </button>
          <button className="btn-primary">
            <Activity className="h-4 w-4 mr-2" />
            View Logs
          </button>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pipeline Status</p>
              <p className="text-2xl font-semibold text-green-600">Running</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Elapsed Time</p>
              <p className="text-2xl font-semibold text-blue-600">7m 20s</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Data Processed</p>
              <p className="text-2xl font-semibold text-purple-600">85K</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-orange-600">99.6%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Execution Steps</h3>
        <div className="space-y-4">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-lg ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                    <span className="text-sm text-gray-500">{step.duration}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  
                  {/* Progress bar for running step */}
                  {step.status === 'running' && step.details.progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{step.details.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.details.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step details */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                    {Object.entries(step.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="ml-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AWS Services Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AWS Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {awsServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                  <div className="flex items-center mt-1">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      service.color === 'green' ? 'text-green-600 bg-green-100' :
                      service.color === 'yellow' ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        service.color === 'green' ? 'bg-green-500' :
                        service.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      {service.status}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{service.usage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Logs</h3>
        <div className="space-y-2">
          {recentLogs.map((log, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                  {log.level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{log.message}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>{log.timestamp}</span>
                  <span className="mx-2">•</span>
                  <span>{log.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataPipeline;
