import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const StatusIndicator = ({ name, status, icon: Icon }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <div className="flex items-center mt-1">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
